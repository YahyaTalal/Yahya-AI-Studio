import os
import re
import random

STOP_WORDS = {
    'the', 'a', 'an', 'and', 'or', 'but', 'if', 'because', 'as', 'what',
    'when', 'where', 'why', 'how', 'who', 'which', 'this', 'that', 'these',
    'those', 'then', 'so', 'than', 'to', 'for', 'of', 'in', 'on', 'at',
    'by', 'with', 'about', 'against', 'between', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'from', 'up', 'down', 'out', 'off',
    'over', 'under', 'again', 'further', 'once', 'here', 'there', 'all', 'any',
    'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's',
    't', 'can', 'will', 'just', 'don', 'should', 'now', 'stock', 'video',
    'footage', 'image', 'photo', 'clip', 'media', 'news', 'health'
}

def clean_text_to_words(text):
    """
    Cleans text by removing punctuation, converting to lowercase, and splitting.
    """
    text = text.lower()
    # Replace non-alphanumeric with spaces
    text = re.sub(r'[^a-z0-9\s_]', '', text)
    # Split by spaces or underscores
    words = re.split(r'[\s_]+', text)
    return [w for w in words if w and w not in STOP_WORDS]

def scan_media_library(library_root="Media Library"):
    """
    Scans the media library folder for video, image, and audio files and indexes them.
    Returns:
        list of dict: List of indexed files with metadata and keywords.
    """
    indexed_files = []
    
    if not os.path.exists(library_root):
        os.makedirs(library_root, exist_ok=True)
        
    supported_extensions = ('.mp4', '.mov', '.jpg', '.png', '.jpeg', '.mp3', '.wav')
    
    for root, dirs, files in os.walk(library_root):
        for file in files:
            if file.lower().endswith(supported_extensions):
                file_path = os.path.join(root, file)
                # Compute relative path for API use
                rel_path = os.path.relpath(file_path, start=os.getcwd())
                # Replace backslashes for web paths
                rel_path = rel_path.replace('\\', '/')
                
                # Extract path parts
                rel_dir = os.path.relpath(root, start=library_root)
                dir_parts = [p for p in rel_dir.split(os.sep) if p and p != '.']
                
                # Keywords from folder structure
                folder_keywords = []
                for part in dir_parts:
                    folder_keywords.extend(clean_text_to_words(part))
                
                # Keywords from file name
                name_without_ext = os.path.splitext(file)[0]
                file_keywords = clean_text_to_words(name_without_ext)
                
                all_keywords = list(set(folder_keywords + file_keywords))
                
                file_ext = file.lower()
                if file_ext.endswith(('.mp4', '.mov')):
                    file_type = "video"
                elif file_ext.endswith(('.mp3', '.wav')):
                    file_type = "audio"
                else:
                    file_type = "image"
                
                indexed_files.append({
                    "path": rel_path,
                    "filename": file,
                    "type": file_type,
                    "keywords": all_keywords,
                    "folders": dir_parts
                })
                
    return indexed_files

def match_stock_media(transcript_text, indexed_files, used_paths=None):
    """
    Matches transcription text to stock media files in the library.
    Args:
        transcript_text (str): Sentence or phrase to match against.
        indexed_files (list): The list returned by scan_media_library.
        used_paths (set): Paths already used in this render to avoid repetition.
    Returns:
        dict: The best matching file dict, or None if no match.
    """
    if not indexed_files:
        return None
        
    if used_paths is None:
        used_paths = set()
        
    search_words = clean_text_to_words(transcript_text)
    if not search_words:
        return None
        
    best_match = None
    best_score = 0
    
    # Shuffle files to add randomness when scores are tied
    shuffled_files = list(indexed_files)
    random.shuffle(shuffled_files)
    
    for file_info in shuffled_files:
        score = 0
        file_keys = file_info["keywords"]
        
        # Calculate overlap score
        for word in search_words:
            if word in file_keys:
                score += 2 # Direct keyword match
            else:
                # Partial match (e.g. "hearts" matches keyword "heart")
                for key in file_keys:
                    if word.startswith(key) or key.startswith(word):
                        score += 1
                        break
                        
        if score > 0:
            # Penalize slightly if this clip has already been used in this project
            if file_info["path"] in used_paths:
                score *= 0.5
                
            if score > best_score:
                best_score = score
                best_match = file_info
                
    # We require a threshold score to prevent matching irrelevant clips
    if best_score >= 1.0:
        return best_match
        
    return None
