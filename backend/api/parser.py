import re
import pdfplumber
from .models import Question

def parse_exam_pdf(exam, pdf_path):
    """
    Extracts text from a PDF and attempts to parse it into MCQ questions.
    Expects format like:
    1. Question text?
    A) Option One
    B) Option Two
    C) Option Three
    D) Option Four
    Correct Answer: B
    """
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return 0

    # Heuristic: Find blocks starting with a digit and a dot or paren
    # Example: "1. " or "1) "
    q_blocks = re.split(r'\n\s*\d+[\.\)]\s+', text)
    
    # If the first block is empty (common if file starts with 1.), remove it
    if q_blocks and not q_blocks[0].strip():
        q_blocks.pop(0)

    # Clear existing questions for a clean sync
    Question.objects.filter(exam=exam).delete()

    imported_count = 0
    for block in q_blocks:
        if not block.strip():
            continue
            
        # 1. EXTRACT MAIN TEXT
        # Stop at the first option choice (A, B, C, or D)
        main_text_match = re.split(r'\n?\s*[A-D][\.\)]\s+', block, maxsplit=1)
        if not main_text_match:
            continue
            
        question_text = main_text_match[0].strip()
        
        # 2. EXTRACT OPTIONS
        # Regex to find options like A) ... B) ... etc.
        # It looks for A. or A) and grabs everything until the next letter or Answer key
        options_raw = re.findall(r'([A-D])[\.\)]\s+(.*?)(?=\n?\s*[A-D][\.\)]|Correct|Ans|Answer|$)', block, re.DOTALL)
        
        options_list = []
        option_map = {} # letter -> index for answer mapping
        
        for i, (letter, opt_val) in enumerate(options_raw):
            clean_opt = opt_val.strip()
            options_list.append(clean_opt)
            option_map[letter.upper()] = i
            
        # 3. EXTRACT CORRECT ANSWER
        # Look for "Correct Answer: A" or "Ans: A" or "Answer: A"
        ans_match = re.search(r'(?:Correct Answer|Ans|Answer):\s*([A-D])', block, re.IGNORECASE)
        correct_answer = ""
        
        if ans_match:
            ans_letter = ans_match.group(1).upper()
            idx = option_map.get(ans_letter)
            if idx is not None and idx < len(options_list):
                correct_answer = options_list[idx]
        
        # 4. SAVE TO DATABASE
        if question_text and len(options_list) >= 2:
            Question.objects.create(
                exam=exam,
                text=question_text,
                options=options_list,
                correct_answer=correct_answer or "A", # Fallback if key missing
                marks=1
            )
            imported_count += 1
            
    return imported_count

def parse_key_pdf(exam, pdf_path):
    """
    Extracts text from a key PDF and updates existing questions.
    Expects format like:
    1. A
    2. B
    3. C
    ...
    """
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print(f"Key PDF extraction error: {e}")
        return 0

    # Look for patterns like "1. A" or "1: A" or "1-A" or "1 A"
    # Heuristic: Find pairs of (number, letter A-D)
    key_pattern = re.compile(r'(\d+)[\.\s\-:]+\s*([A-D])', re.IGNORECASE)
    keys = key_pattern.findall(text)

    # Get existing questions for this exam sorted by ID/text
    # (Assuming the key PDF matches the order of questions in the database)
    questions = list(Question.objects.filter(exam=exam).order_by('id'))
    
    updated_count = 0
    for q_num_str, ans_letter in keys:
        q_idx = int(q_num_str) - 1 # Convert to 0-indexed
        if q_idx < len(questions):
            q = questions[q_idx]
            ans_letter = ans_letter.upper()
            idx = ord(ans_letter) - ord('A')
            if idx < len(q.options):
                 q.correct_answer = q.options[idx]
                 q.save()
                 updated_count += 1
                 
    return updated_count
