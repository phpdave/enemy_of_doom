from PIL import Image, ImageDraw
import random
import math

def create_enemy_frame(width, height, color, eye_color=(255, 0, 0)):
    # Create a new image with transparency
    frame = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame)
    
    # Calculate center points
    center_x = width // 2
    center_y = height // 2
    
    # Draw the main body (more complex shape)
    body_width = 30
    body_height = 35
    
    # Create a more detailed body shape
    body_points = [
        (center_x - body_width//2, center_y),  # left middle
        (center_x - body_width//3, center_y - body_height//2),  # left shoulder
        (center_x, center_y - body_height//1.5),  # head top
        (center_x + body_width//3, center_y - body_height//2),  # right shoulder
        (center_x + body_width//2, center_y),  # right middle
        (center_x + body_width//3, center_y + body_height//2),  # right hip
        (center_x, center_y + body_height//2),  # bottom
        (center_x - body_width//3, center_y + body_height//2),  # left hip
    ]
    
    # Draw body shadow (darker version of main color)
    shadow_color = (
        int(max(0, color[0] - 40)),
        int(max(0, color[1] - 40)),
        int(max(0, color[2] - 40)),
        int(color[3])
    )
    shadow_points = [(x + 2, y + 2) for x, y in body_points]
    draw.polygon(shadow_points, fill=shadow_color)
    
    # Draw main body
    draw.polygon(body_points, fill=tuple(int(c) for c in color))
    
    # Add armor plates (lighter version of main color)
    highlight_color = (
        int(min(255, color[0] + 40)),
        int(min(255, color[1] + 40)),
        int(min(255, color[2] + 40)),
        int(color[3])
    )
    
    # Draw armor segments
    for i in range(3):
        y_offset = -10 + i * 10
        draw.line(
            [(center_x - 10, center_y + y_offset), 
             (center_x + 10, center_y + y_offset)],
            fill=highlight_color,
            width=2
        )
    
    # Draw eyes with glowing effect
    eye_spacing = 8
    eye_size = 4
    
    # Eye glow (outer)
    glow_color = (
        int(eye_color[0]),
        int(eye_color[1]),
        int(eye_color[2]),
        100
    )
    for i in range(2):
        x = center_x - eye_spacing + (i * 2 * eye_spacing)
        y = center_y - 5
        draw.ellipse(
            (x - eye_size - 2, y - eye_size - 2,
             x + eye_size + 2, y + eye_size + 2),
            fill=glow_color
        )
    
    # Main eyes
    for i in range(2):
        x = center_x - eye_spacing + (i * 2 * eye_spacing)
        y = center_y - 5
        draw.ellipse(
            (x - eye_size, y - eye_size,
             x + eye_size, y + eye_size),
            fill=tuple(int(c) for c in eye_color)
        )
    
    # Add horns
    horn_color = (80, 80, 80, 255)
    horn_points_left = [
        (center_x - 12, center_y - 15),
        (center_x - 15, center_y - 25),
        (center_x - 10, center_y - 20),
    ]
    horn_points_right = [
        (center_x + 12, center_y - 15),
        (center_x + 15, center_y - 25),
        (center_x + 10, center_y - 20),
    ]
    draw.polygon(horn_points_left, fill=horn_color)
    draw.polygon(horn_points_right, fill=horn_color)
    
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
    
    # Base color for the enemy (darker purple for more menacing look)
    base_color = (90, 20, 120, 255)
    
    # Generate frames with slight variations
    for i in range(num_frames):
        # Create pulsing effect
        pulse = int(math.sin(i * math.pi / 3) * 20)  # Smoother pulsing
        frame_color = (
            int(max(0, min(255, base_color[0] + pulse))),
            int(max(0, min(255, base_color[1] + pulse))),
            int(max(0, min(255, base_color[2] + pulse))),
            base_color[3]
        )
        
        # Vary eye color for a pulsing effect
        eye_color = (
            255,  # Red
            int(max(0, min(255, pulse * 2))),  # Green varies
            0,    # Blue
            255   # Alpha
        )
        
        # Create frame
        frame = create_enemy_frame(frame_width, frame_height, frame_color, eye_color)
        
        # Add frame to sprite sheet
        sprite_sheet.paste(frame, (i * frame_width, 0))
    
    # Save the sprite sheet
    sprite_sheet.save('assets/enemy.png', 'PNG')
    print("Enemy sprite sheet generated as 'enemy.png'")

if __name__ == "__main__":
    create_sprite_sheet() 