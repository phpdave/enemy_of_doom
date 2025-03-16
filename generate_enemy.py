from PIL import Image, ImageDraw
import random

def create_enemy_frame(width, height, color, eye_color=(255, 0, 0)):
    # Create a new image with transparency
    frame = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame)
    
    # Calculate center points
    center_x = width // 2
    center_y = height // 2
    
    # Draw the main body (triangle shape for a simple enemy)
    body_points = [
        (center_x, center_y - 15),  # top
        (center_x - 15, center_y + 15),  # bottom left
        (center_x + 15, center_y + 15)   # bottom right
    ]
    draw.polygon(body_points, fill=color)
    
    # Draw eyes
    eye_radius = 3
    draw.ellipse((center_x - 8 - eye_radius, center_y - 5 - eye_radius, 
                  center_x - 8 + eye_radius, center_y - 5 + eye_radius), 
                 fill=eye_color)
    draw.ellipse((center_x + 8 - eye_radius, center_y - 5 - eye_radius,
                  center_x + 8 + eye_radius, center_y - 5 + eye_radius),
                 fill=eye_color)
    
    return frame

def create_sprite_sheet():
    # Sprite sheet dimensions
    frame_width = 48
    frame_height = 48
    num_frames = 6
    sheet_width = frame_width * num_frames
    sheet_height = frame_height
    
    # Create the sprite sheet
    sprite_sheet = Image.new('RGBA', (sheet_width, sheet_height), (0, 0, 0, 0))
    
    # Base color for the enemy (purple)
    base_color = (128, 0, 128, 255)
    
    # Generate frames with slight variations
    for i in range(num_frames):
        # Vary the color slightly for animation effect
        color_variation = random.randint(-20, 20)
        frame_color = (
            max(0, min(255, base_color[0] + color_variation)),
            base_color[1],
            max(0, min(255, base_color[2] + color_variation)),
            base_color[3]
        )
        
        # Create frame
        frame = create_enemy_frame(frame_width, frame_height, frame_color)
        
        # Add frame to sprite sheet
        sprite_sheet.paste(frame, (i * frame_width, 0))
    
    # Save the sprite sheet
    sprite_sheet.save('assets/enemy.png', 'PNG')
    print("Enemy sprite sheet generated as 'enemy.png'")

if __name__ == "__main__":
    create_sprite_sheet() 