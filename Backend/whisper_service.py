import whisper
import os
import torch

_model = None

def get_model(model_name="tiny"):
    """
    Loads and caches the Whisper model.
    Forces CPU execution as requested.
    """
    global _model
    if _model is None:
        print(f"Loading Whisper model '{model_name}' on CPU...")
        # Force CPU device for 6GB RAM/low-end systems
        _model = whisper.load_model(model_name, device="cpu")
        print("Whisper model loaded successfully.")
    return _model

def transcribe_audio(audio_path: str, model_name="tiny"):
    """
    Transcribes audio file to get text segments with word-level timestamps.
    Returns:
        dict: The raw whisper result dictionary containing segments and words.
    """
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")
    
    model = get_model(model_name)
    print(f"Transcribing {audio_path} using Whisper '{model_name}'...")
    
    # Run transcription with word timestamps enabled
    result = model.transcribe(
        audio_path,
        word_timestamps=True,
        task="transcribe",
        language=None  # Auto-detect language
    )
    
    print("Transcription completed.")
    return result
