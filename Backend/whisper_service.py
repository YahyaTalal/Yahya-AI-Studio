import os

# NOTE (live deploy): whisper + torch are imported lazily inside get_model()
# so the server starts fast and light. They are only needed for transcription.

_model = None

def _load_whisper():
    try:
        import whisper
    except ImportError as e:
        raise RuntimeError(
            "Whisper is not installed in this environment. "
            "Transcription is disabled."
        ) from e
    return whisper

def get_model(model_name="tiny"):
    """
    Loads and caches the Whisper model.
    Forces CPU execution as requested.
    """
    global _model
    if _model is None:
        whisper = _load_whisper()
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
