import numpy as np
from scipy.io import wavfile
import os

def create_swoosh_sound():
    # Create assets directory if it doesn't exist
    os.makedirs('assets', exist_ok=True)
    
    # Sound parameters
    sample_rate = 44100
    duration = 0.25  # shorter duration for snappier effect
    t = np.linspace(0, duration, int(sample_rate * duration))
    
    # Create a more complex swoosh effect
    # Main swoosh component (higher frequency sweep)
    freq1 = 2000 * np.exp(-t * 15)  # Faster frequency drop
    phase1 = 2 * np.pi * np.cumsum(freq1) / sample_rate
    amp1 = np.exp(-t * 20)  # Faster amplitude decay
    
    # Secondary swoosh component (lower frequency for body)
    freq2 = 800 * np.exp(-t * 12)
    phase2 = 2 * np.pi * np.cumsum(freq2) / sample_rate
    amp2 = np.exp(-t * 15)
    
    # Combine components
    wave = 0.7 * amp1 * np.sin(phase1) + 0.3 * amp2 * np.sin(phase2)
    
    # Add some noise for texture
    noise = np.random.normal(0, 0.1, len(t))
    noise_env = np.exp(-t * 25)  # Quick noise decay
    wave += noise * noise_env
    
    # Add a small fade in/out to prevent clicks
    fade_samples = int(0.005 * sample_rate)  # 5ms fade
    fade_in = np.linspace(0, 1, fade_samples)
    fade_out = np.linspace(1, 0, fade_samples)
    wave[:fade_samples] *= fade_in
    wave[-fade_samples:] *= fade_out
    
    # Normalize and apply soft clipping for better sound
    wave = np.tanh(wave * 1.5)  # Soft clipping
    wave = wave / np.max(np.abs(wave))  # Normalize
    
    # Convert to 16-bit PCM
    wave = np.int16(wave * 32767)
    
    # Save as WAV file
    try:
        wavfile.write('assets/swoosh.wav', sample_rate, wave)
        print("Swoosh sound generated successfully as 'assets/swoosh.wav'")
    except Exception as e:
        print(f"Error saving sound file: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    if not create_swoosh_sound():
        exit(1) 