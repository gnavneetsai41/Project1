from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import io
from PIL import Image
from pymongo import MongoClient
from datetime import datetime
import base64
import requests
from bson import ObjectId

app = Flask(__name__)

# Configure CORS with specific options
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "expose_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    # Add Content Security Policy headers
    response.headers.add('Content-Security-Policy', 
        "default-src 'self' http://localhost:5173 http://localhost:3001; "
        "img-src 'self' data: blob: http://localhost:5173 http://localhost:3001; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173; "
        "style-src 'self' 'unsafe-inline' http://localhost:5173; "
        "connect-src 'self' http://localhost:5173 http://localhost:3001;"
    )
    return response

# MongoDB setup
client = MongoClient('mongodb://localhost:27017/')
db = client['jewellery']
images_collection = db['images']

# Load the generator models
generator2 = tf.keras.models.load_model("C:/Users/NEW/Downloads/pix2pix_generator_epoch_28.keras")
generator3 = tf.keras.models.load_model("C:/Users/NEW/Downloads/pix2pix_generator_epoch_43.keras")
generator1 = tf.keras.models.load_model("C:/Users/NEW/Downloads/generator_epoch_26.keras")
classify = tf.keras.models.load_model("C:/Users/NEW/Downloads/gold_vs_sketch_model.h5")

# Hugging Face API details for image captioning
API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large"
headers = {"Authorization": "Bearer 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"}  # Replace with your actual token

# Add rate limiting and retry logic
def query_huggingface_api(image_bytes):
    try:
        response = requests.post(API_URL, headers=headers, data=image_bytes)
        if response.status_code == 429:  # Rate limit exceeded
            return "Rate limit exceeded. Please try again later."
        elif response.status_code != 200:
            return "Error generating caption"
        return response.json()[0]['generated_text']
    except Exception as e:
        print(f"Error in Hugging Face API call: {str(e)}")
        return "Error generating caption"

def load_image_for_prediction(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert('RGB')
    image = np.array(image)
    image = cv2.resize(image, (256, 256))
    image = (image / 127.5) - 1
    return np.expand_dims(image, axis=0).astype(np.float32)

def process_image_with_model(image_array, model):
    predicted_image = model(image_array, training=False)
    return (predicted_image[0] + 1) / 2

def image_to_base64(image):
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode()

def save_to_mongodb(email, sketch_image, generated_image):
    try:
        # Convert images to base64
        sketch_buffer = io.BytesIO()
        sketch_image.save(sketch_buffer, format='PNG')
        sketch_base64 = base64.b64encode(sketch_buffer.getvalue()).decode('utf-8')

        generated_buffer = io.BytesIO()
        generated_image.save(generated_buffer, format='PNG')
        generated_base64 = base64.b64encode(generated_buffer.getvalue()).decode('utf-8')

        # Create document for MongoDB
        image_data = {
            'email': email,
            'sketch_image': sketch_base64,
            'generated_image': generated_base64,
            'timestamp': datetime.utcnow()
        }

        # Save to MongoDB
        images_collection.insert_one(image_data)
    except Exception as e:
        print(f"Error saving to MongoDB: {str(e)}")
        raise e

def is_jewelry(caption):
    jewelry_keywords = ["jewelry", "ring", "necklace", "chain", "bracelet", "earring"]
    for keyword in jewelry_keywords:
        if keyword in caption.lower():
            return True
    return False

def classify_image_as_sketch(image_bytes):
    try:
        # Load the image from bytes and preprocess it
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')  # Convert to RGB if needed
        image = image.resize((150, 150))  # Resize to match model input size if required
        image_array = np.array(image) / 255.0  # Normalize pixel values
        image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension

        # Use the classify model to predict
        prediction = classify.predict(image_array)  # Assuming classify is the model variable

        # Interpret the prediction (e.g., binary classification: 0 = not sketch, 1 = sketch)
        is_sketch = prediction[0] > 0.5  # Adjust threshold if needed
        return bool(is_sketch)
    except Exception as e:
        print(f"Error in classify_image_as_sketch: {e}")
        return False

@app.route('/api/upload/model1', methods=['POST'])
def process_image_model1():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        email = request.form.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
            
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if file:
            try:
                # Read the image once
                image_bytes = file.read()
                
                # Classify the image
                is_sketch = classify_image_as_sketch(image_bytes)
                if not is_sketch:
                    return jsonify({'error': 'The uploaded image does not appear to be a sketch'}), 400

                # Generate caption and validate if it's jewelry-related
                caption = query_huggingface_api(image_bytes)
                if not is_jewelry(caption):
                    return jsonify({'error': 'The image does not appear to be jewelry-related'}), 400

                # Process image with model1
                sketch_image = load_image_for_prediction(image_bytes)
                predicted_image = process_image_with_model(sketch_image, generator1)

                # Convert to PIL image and return
                generated_pil = Image.fromarray((predicted_image * 255).numpy().astype(np.uint8))
                img_byte_arr = io.BytesIO()
                generated_pil.save(img_byte_arr, format='PNG')
                img_byte_arr.seek(0)

                return send_file(img_byte_arr, mimetype='image/png')
                
            except tf.errors.ResourceExhaustedError:
                return jsonify({'error': 'Model resources exhausted. Please try again in a few minutes.'}), 503
            except Exception as e:
                return jsonify({'error': f'Image processing error: {str(e)}'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload/model2', methods=['POST'])
def process_image_model2():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        email = request.form.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
            
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if file:
            try:
                # Read the image once
                image_bytes = file.read()
                
                # Classify the image
                is_sketch = classify_image_as_sketch(image_bytes)
                if not is_sketch:
                    return jsonify({'error': 'The uploaded image does not appear to be a sketch'}), 400

                # Generate caption and validate if it's jewelry-related
                caption = query_huggingface_api(image_bytes)
                if not is_jewelry(caption):
                    return jsonify({'error': 'The image does not appear to be jewelry-related'}), 400

                # Process image with model2
                sketch_image = load_image_for_prediction(image_bytes)
                predicted_image = process_image_with_model(sketch_image, generator2)

                # Convert to PIL image and return
                generated_pil = Image.fromarray((predicted_image * 255).numpy().astype(np.uint8))
                img_byte_arr = io.BytesIO()
                generated_pil.save(img_byte_arr, format='PNG')
                img_byte_arr.seek(0)

                return send_file(img_byte_arr, mimetype='image/png')
                
            except tf.errors.ResourceExhaustedError:
                return jsonify({'error': 'Model resources exhausted. Please try again in a few minutes.'}), 503
            except Exception as e:
                return jsonify({'error': f'Image processing error: {str(e)}'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload/model3', methods=['POST'])
def process_image_model3():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        email = request.form.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
            
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if file:
            try:
                # Read the image once
                image_bytes = file.read()
                
                # Classify the image
                is_sketch = classify_image_as_sketch(image_bytes)
                if not is_sketch:
                    return jsonify({'error': 'The uploaded image does not appear to be a sketch'}), 400

                # Generate caption and validate if it's jewelry-related
                caption = query_huggingface_api(image_bytes)
                if not is_jewelry(caption):
                    return jsonify({'error': 'The image does not appear to be jewelry-related'}), 400

                # Process image with model3
                sketch_image = load_image_for_prediction(image_bytes)
                predicted_image = process_image_with_model(sketch_image, generator3)

                # Convert to PIL image and return
                generated_pil = Image.fromarray((predicted_image * 255).numpy().astype(np.uint8))
                img_byte_arr = io.BytesIO()
                generated_pil.save(img_byte_arr, format='PNG')
                img_byte_arr.seek(0)

                return send_file(img_byte_arr, mimetype='image/png')
                
            except tf.errors.ResourceExhaustedError:
                return jsonify({'error': 'Model resources exhausted. Please try again in a few minutes.'}), 503
            except Exception as e:
                return jsonify({'error': f'Image processing error: {str(e)}'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload/caption', methods=['POST'])
def process_image_for_caption():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    image_bytes = file.read()

    # Call the Hugging Face API to get a caption for the image
    result = query_huggingface_api(image_bytes)
    print(result)  # Print the Hugging Face response for debugging

    # Check if the response contains a valid caption
    if "error" in result:
        return jsonify({"error": result["error"]}), 400

    caption = result.get("caption", "No caption generated.")
    
    # Check if the image contains jewelry
    if is_jewelry(caption):
        return jsonify({"caption": caption, "is_jewelry": True})
    else:
        return jsonify({"caption": caption, "is_jewelry": False})

@app.route('/api/images/my-images', methods=['GET'])
def get_user_images():
    try:
        email = request.args.get('email')
        if not email:
            return jsonify({'error': 'Email is required'}), 400

        # Get all images for the user from MongoDB
        images = list(images_collection.find(
            {'email': email}
        ).sort('timestamp', -1))  # Sort by timestamp, newest first
        
        # Convert ObjectId to string for JSON serialization
        for image in images:
            image['_id'] = str(image['_id'])
            
        return jsonify(images), 200

    except Exception as e:
        print(f"Error fetching images: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/images/count', methods=['GET'])
def get_image_count():
    try:
        email = request.args.get('email')
        if not email:
            return jsonify({'error': 'Email is required'}), 400

        # Count images for the user
        count = images_collection.count_documents({'email': email})
        return jsonify({'count': count}), 200

    except Exception as e:
        print(f"Error getting image count: {str(e)}")
        return jsonify({'error': 'Failed to get image count'}), 500

@app.route('/api/images/save', methods=['POST', 'OPTIONS'])
def save_images():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        return response

    try:
        if 'sketch' not in request.files or 'generated' not in request.files:
            return jsonify({'error': 'Both sketch and generated images are required'}), 400
            
        email = request.form.get('email')
        if not email:
            return jsonify({'error': 'Email is required'}), 400
            
        sketch_file = request.files['sketch']
        generated_file = request.files['generated']
        
        if sketch_file.filename == '' or generated_file.filename == '':
            return jsonify({'error': 'No selected files'}), 400

        # Convert files to PIL Images
        sketch_image = Image.open(sketch_file).convert('RGB')
        generated_image = Image.open(generated_file).convert('RGB')
        
        # Save to MongoDB
        save_to_mongodb(email, sketch_image, generated_image)
        
        return jsonify({'message': 'Images saved successfully'}), 200
        
    except Exception as e:
        print(f"Error saving images: {str(e)}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/images/delete/<image_id>', methods=['DELETE', 'OPTIONS'])
def delete_image(image_id):
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # Validate email
        email = request.args.get('email')
        if not email:
            return jsonify({'error': 'Email is required'}), 400

        # Validate image_id
        if not image_id:
            return jsonify({'error': 'Image ID is required'}), 400

        # Convert string ID to ObjectId
        try:
            obj_id = ObjectId(image_id)
        except Exception as e:
            print(f"Invalid ObjectId format: {str(e)}")
            return jsonify({'error': 'Invalid image ID format'}), 400

        # Find the image first to verify ownership
        image = images_collection.find_one({
            '_id': obj_id,
            'email': email
        })

        if not image:
            return jsonify({'error': 'Image not found or unauthorized'}), 404

        # Delete the image
        result = images_collection.delete_one({
            '_id': obj_id,
            'email': email
        })

        if result.deleted_count == 0:
            return jsonify({'error': 'Failed to delete image'}), 500

        return jsonify({
            'message': 'Image deleted successfully',
            'deleted_id': str(obj_id)
        }), 200

    except Exception as e:
        print(f"Error deleting image: {str(e)}")
        return jsonify({'error': 'Server error while deleting image'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001)
