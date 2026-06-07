from typing import Any, Text, Dict, List
import mysql.connector
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import os
import json
from .maps_service import maps_service

class ActionSearchProperties(Action):
    def name(self) -> Text:
        return "action_search_properties"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Extract slots
        budget = tracker.get_slot("budget")
        location = tracker.get_slot("location") # For dynamic matching (thana/district)
        landmark = tracker.get_slot("landmark") # For "near airport", "near hospital"
        property_type = tracker.get_slot("property_type")
        bedrooms = tracker.get_slot("bedrooms")
        bathrooms = tracker.get_slot("bathrooms")
        amenities = tracker.get_slot("property_amenities")
        
        # DYNAMIC LANDMARK EXTRACTION FALLBACK
        # If Rasa NLU missed part of a long landmark name, use regex to catch anything after "near", "close to", or "around"
        text = tracker.latest_message.get('text', '').lower()
        import re
        match = re.search(r'(?:near|around|close to)\s+(.*?)(?=\s+(?:under|with|in|for|having)|$)', text)
        if match:
            extracted_landmark = match.group(1).strip()
            # If NLU extracted nothing, or our regex found a longer (more complete) name, use it!
            if not landmark or len(extracted_landmark) > len(str(landmark)):
                landmark = extracted_landmark
        
        landmark_data = None
        try:
            db = mysql.connector.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                user=os.getenv('DB_USER', 'root'),
                password=os.getenv('DB_PASSWORD', ''),
                database=os.getenv('DB_NAME', 'property_management')
            )
            cursor = db.cursor(dictionary=True)
            
            # Base SELECT
            select_clause = "SELECT p.id, p.title, p.description, p.property_type, p.monthly_rent, p.expected_security_deposit, p.total_bedrooms, p.total_bathrooms, p.property_size_sqft, p.division, p.district, p.area, p.address, p.latitude, p.longitude, (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id LIMIT 1) as cover_image"
            
            # Distance logic for landmarks
            having_clause = ""
            params = []
            
            if landmark:
                geo_res = maps_service.find_landmark(landmark)
                if geo_res.get('success'):
                    lat = geo_res['coordinates']['lat']
                    lng = geo_res['coordinates']['lng']
                    
                    haversine = f"(6371 * acos(cos(radians(%s)) * cos(radians(latitude)) * cos(radians(longitude) - radians(%s)) + sin(radians(%s)) * sin(radians(latitude))))"
                    select_clause += f", {haversine} AS distance"
                    
                    params.extend([lat, lng, lat])
                    landmark_data = geo_res
                    having_clause = " HAVING distance <= 2"
                else:
                    from rasa_sdk.events import SlotSet
                    dispatcher.utter_message(text=f"I couldn't find the location '{landmark}'. Try another place.")
                    return [SlotSet("landmark", None)]

            query = select_clause + " FROM properties p WHERE p.visibility_status = 'active'"
            
            if location and not landmark:
                query += " AND (p.area LIKE %s OR p.district LIKE %s OR p.address LIKE %s)"
                loc_pattern = f"%{location}%"
                params.extend([loc_pattern, loc_pattern, loc_pattern])
            
            if budget:
                query += " AND p.monthly_rent <= %s"
                params.append(budget)
                
            if property_type:
                prop_type_val = property_type.lower()
                if prop_type_val.endswith('s') and prop_type_val not in ['premises']:
                    prop_type_val = prop_type_val[:-1]
                if prop_type_val == 'flat':
                    prop_type_val = 'apartment'
                query += " AND p.property_type LIKE %s"
                params.append(f"%{prop_type_val}%")
                
            if bedrooms:
                query += " AND p.total_bedrooms = %s"
                params.append(bedrooms)
                
            if bathrooms:
                query += " AND p.total_bathrooms = %s"
                params.append(bathrooms)
                
            # Amenities filter
            if amenities:
                if isinstance(amenities, str):
                    amenities = [amenities]
                for am in amenities:
                    query += f" AND EXISTS (SELECT 1 FROM property_amenities pa JOIN amenities a ON pa.amenity_id = a.id WHERE pa.property_id = p.id AND a.name LIKE %s)"
                    params.append(f"%{am}%")
            
            if having_clause:
                query += having_clause + " ORDER BY distance ASC LIMIT 10"
            else:
                query += " ORDER BY p.monthly_rent ASC LIMIT 10"
            
            cursor.execute(query, params)
            properties = cursor.fetchall()
            
            cursor.close()
            db.close()
            
            if properties:
                msg_payload = {"properties": properties}
                if landmark_data:
                    msg_payload["landmarkData"] = landmark_data
                dispatcher.utter_message(
                    text=f"I found {len(properties)} properties matching your criteria.",
                    json_message=msg_payload
                )
            else:
                msg_payload = {"properties": []}
                if landmark_data:
                    msg_payload["landmarkData"] = landmark_data
                dispatcher.utter_message(
                    text="I couldn't find any properties matching your criteria right now.",
                    json_message=msg_payload
                )
                
        except Exception as e:
            dispatcher.utter_message(text=f"Property search failed: {str(e)}")
            
        return []
