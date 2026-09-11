import os
import re

import requests
from sqlalchemy import text

from mysql import get_connection, rows_to_json

ZIP_PATTERN = re.compile(r"^\d{5}(-\d{4})?$")
TIER_ORDER = "FIELD(tier, 'recommended', 'possible', 'excluded')"


def _api_key():
    return os.getenv("GOOGLE_PLACES_API_KEY")


def _normalize_zip(zip_code):
    return zip_code.strip()


def _validate_zip(zip_code):
    if not ZIP_PATTERN.match(zip_code):
        raise ValueError("zip_code must be a 5-digit US zip (optional +4).")


def _geocode(query, api_key):
    if not api_key or not query:
        return None

    response = requests.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        params={"address": query, "key": api_key},
        timeout=10,
    )
    response.raise_for_status()
    payload = response.json()
    if payload.get("status") != "OK" or not payload.get("results"):
        return None

    location = payload["results"][0]["geometry"]["location"]
    return {"lat": location["lat"], "lng": location["lng"]}


def _center_from_facilities(facilities):
    located = [f for f in facilities if f.get("lat") is not None and f.get("lng") is not None]
    if not located:
        return None
    return {
        "lat": sum(f["lat"] for f in located) / len(located),
        "lng": sum(f["lng"] for f in located) / len(located),
    }


def _enrich_with_coordinates(facilities, zip_code):
    api_key = _api_key()
    center = _geocode(f"{zip_code}, USA", api_key) if api_key else None

    for facility in facilities:
        if facility.get("lat") is not None and facility.get("lng") is not None:
            continue
        address = facility.get("facility_address")
        if address and api_key:
            coords = _geocode(address, api_key)
            if coords:
                facility.update(coords)

    if not center:
        center = _center_from_facilities(facilities)
    return center


def geocode_records(records, address_field="location"):
    """Attach lat/lng to records using the Geocoding API and school addresses from the DB."""
    api_key = _api_key()
    for record in records:
        if record.get("lat") is not None and record.get("lng") is not None:
            continue
        address = record.get(address_field)
        if address and api_key:
            coords = _geocode(address, api_key)
            if coords:
                record.update(coords)
    return _center_from_facilities(records)


def search_stored_facilities(zip_code, therapy_type=None):
    sql = text(
        f"""
        SELECT therapy_type, facility_name, facility_address, source, tier,
               total_score, result_type
        FROM (
            SELECT
                therapy_type,
                facility_name,
                facility_address,
                source,
                tier,
                total_score,
                result_type,
                ROW_NUMBER() OVER (
                    PARTITION BY therapy_type, facility_name
                    ORDER BY {TIER_ORDER}, total_score DESC
                ) AS row_num
            FROM facility_search_events
            WHERE zip_code = :zip_code
              AND result_type = 'facility'
              AND (:therapy_type IS NULL OR therapy_type = :therapy_type)
        ) ranked
        WHERE row_num = 1
        ORDER BY {TIER_ORDER}, total_score DESC
        """
    )
    with get_connection() as conn:
        rows = conn.execute(
            sql,
            {"zip_code": zip_code, "therapy_type": therapy_type or None},
        ).mappings().all()
    return rows_to_json(rows)


def search_google_places(zip_code, therapy_type=None):
    api_key = _api_key()
    if not api_key:
        return []

    if therapy_type:
        query = f"{therapy_type} near {zip_code}"
    else:
        query = f"mental health therapy counseling {zip_code}"

    response = requests.get(
        "https://maps.googleapis.com/maps/api/place/textsearch/json",
        params={"query": query, "key": api_key},
        timeout=10,
    )
    response.raise_for_status()
    payload = response.json()
    if payload.get("status") not in ("OK", "ZERO_RESULTS"):
        raise RuntimeError(payload.get("error_message") or payload.get("status"))

    facilities = []
    for place in payload.get("results", [])[:15]:
        location = place.get("geometry", {}).get("location", {})
        facilities.append(
            {
                "therapy_type": therapy_type or "General therapy",
                "facility_name": place.get("name"),
                "facility_address": place.get("formatted_address"),
                "source": "google_places",
                "tier": "possible",
                "total_score": None,
                "result_type": "facility",
                "lat": location.get("lat"),
                "lng": location.get("lng"),
            }
        )
    return facilities


def search_facilities(zip_code, therapy_type=None):
    zip_code = _normalize_zip(zip_code)
    _validate_zip(zip_code)
    therapy_type = therapy_type.strip() if therapy_type else None

    if _api_key():
        live = search_google_places(zip_code, therapy_type)
        if live:
            center = _enrich_with_coordinates(live, zip_code)
            return {
                "zip_code": zip_code,
                "source": "google_places",
                "count": len(live),
                "center": center,
                "facilities": live,
            }

    stored = search_stored_facilities(zip_code, therapy_type)
    if stored:
        center = _enrich_with_coordinates(stored, zip_code)
        return {
            "zip_code": zip_code,
            "source": "stored",
            "count": len(stored),
            "center": center,
            "facilities": stored,
        }

    return {
        "zip_code": zip_code,
        "source": "none",
        "count": 0,
        "center": None,
        "facilities": [],
    }
