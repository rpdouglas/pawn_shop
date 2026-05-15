import os
import sys

try:
    from PIL import Image
except ImportError:
    print("\n[!] Error: The 'Pillow' library is not installed.")
    print("Please run: pip install Pillow\n")
    sys.exit(1)

def slice_persona_headshots(image_path, output_folder="headshot_crops"):
    """
    Slices the 2x4 persona grid into 8 individual PNG files,
    extracting only the headshot portion and trimming an extra 5px off the bottom.
    Existing files in the output folder will be overwritten automatically.
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    try:
        img = Image.open(image_path)
        img_width, img_height = img.size

        # Grid configuration
        rows = 2
        cols = 4

        # Calculate dimensions of the full card
        card_width = img_width // cols
        card_height = img_height // rows

        # Calculate the base height of the image portion (roughly 73% of the card)
        image_ratio = 0.73
        base_headshot_height = int(card_height * image_ratio)

        # Persona names in order (Top Row L-R, Bottom Row L-R)
        persona_names = [
            "Marcus", "Makoonsii", "Dale", "Tanya",
            "Marie", "Kevin", "Sandra", "Jordan"
        ]

        count = 0
        for r in range(rows):
            for c in range(cols):
                # Calculate coordinates for the full card cell
                left = c * card_width
                top = r * card_height
                right = (c + 1) * card_width
                
                # Set the bottom coordinate to the headshot portion MINUS 5 pixels
                bottom = (top + base_headshot_height) - 10
                # Crop the image
                persona_img = img.crop((left, top, right, bottom))
                
                # Format filename: e.g., dale_headshot.png
                name = persona_names[count].lower()
                output_path = os.path.join(output_folder, f"{name}_headshot.png")
                
                # The .save() method automatically overwrites existing files with the same name
                persona_img.save(output_path)
                print(f"Exported (Overwritten if existing): {output_path}")
                
                count += 1
                
    except FileNotFoundError:
        print(f"Error: Could not find '{image_path}'. Check your file path.")

if __name__ == "__main__":
    slice_persona_headshots("personas.png")