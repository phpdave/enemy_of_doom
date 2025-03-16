from PIL import Image, ImageDraw
import os

def create_effect():
    # Create assets directory if it doesn't exist
    os.makedirs('assets', exist_ok=True)
    
    # Create a 32x32 image with transparency
    size = 32
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # Draw a simple glowing circle
    center = size // 2
    radius = size // 4
    
    # Draw outer glow
    for r in range(radius + 4, radius - 1, -1):
        alpha = int(255 * (radius - r + 4) / 8)  # Fade from center
        draw.ellipse(
            (center - r, center - r, center + r, center + r),
            fill=(255, 255, 255, alpha)
        )
    
    # Save the effect
    image.save('assets/effect.png', 'PNG')
    print("Effect sprite generated as 'assets/effect.png'")

if __name__ == "__main__":
    create_effect() 