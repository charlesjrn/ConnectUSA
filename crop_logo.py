from PIL import Image

# Open the original image
img = Image.open('/home/ubuntu/upload/1000006595.png')

# Get image dimensions
width, height = img.size

# Crop to remove the top text - keep from about 15% down to the bottom
# This removes "and on the bottom I will say He's got the who His hands." text
crop_top = int(height * 0.15)
cropped_img = img.crop((0, crop_top, width, height))

# Save the cropped image
cropped_img.save('/home/ubuntu/chosen-connect/client/public/chosen-connect-logo.png')

print(f"Original size: {width}x{height}")
print(f"Cropped size: {cropped_img.size}")
print("Logo cropped and saved successfully!")
