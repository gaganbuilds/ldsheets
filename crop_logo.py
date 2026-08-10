from PIL import Image

def crop_transparent(image_path):
    img = Image.open(image_path)
    img = img.convert("RGBA")
    
    # Get bounding box of non-transparent content
    bbox = img.getbbox()
    
    if bbox:
        # Crop the image to the bounding box
        img_cropped = img.crop(bbox)
        # Save it back
        img_cropped.save(image_path)
        print(f"Cropped image to {bbox}")
    else:
        print("Image is entirely transparent or empty")

if __name__ == '__main__':
    crop_transparent('public/logo.png')
