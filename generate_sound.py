import numpy as np
from scipy.io import wavfile
import os

def create_swoosh_sound():
    # Create assets directory if it doesn't exist
    os.makedirs('assets', exist_ok=True)
    
    # Sound parameters
    sample_rate = 44100
    duration = 0.3  # seconds
    t = np.linspace(0, duration, int(sample_rate * duration))
    
    # Create a swoosh effect using frequency modulation
    frequency = 1000 * np.exp(-t * 10)  # Decreasing frequency
    phase = 2 * np.pi * frequency * t
    amplitude = np.exp(-t * 15)  # Decreasing amplitude
    
    # Generate the sound wave
    wave = amplitude * np.sin(phase)
    
    # Normalize and convert to 16-bit PCM
    wave = np.int16(wave * 32767)
    
    # Save as WAV file
    wavfile.write('assets/swoosh.wav', sample_rate, wave)
    print("Swoosh sound generated as 'assets/swoosh.wav'")

if __name__ == "__main__":
    create_swoosh_sound() 