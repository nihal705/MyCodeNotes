"""One-time: insert a site-info chunk into ai_chunks so NextraAI
answers 'about MyCodeNotes' questions with a 🟢 citation."""
import logging
from app.database import SessionLocal
from app import models
from app.services.embedding import embed_text
from app.services.vector_store import insert_chunk, delete_chunks_for_source

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SITE_INFO = """About MyCodeNotes

MyCodeNotes is a structured learning hub for DSA, programming concepts, practice
problems, and notes — built and maintained by G Nihal.

Founder & Owner: G Nihal — a Computer Science student passionate about
data-structures and algorithms, full-stack development, and building things in
public. He built MyCodeNotes solo: no team, no external collaborators on the
core build.

LinkedIn: https://linkedin.com/in/gnihal705
Email: nihalmohammad705@gmail.com
Live site: https://mycodenotes.vercel.app

Purpose: To document everything he learns while solving LeetCode problems,
practising DSA, and studying web development — organised so it is actually
useful to work through. A public learning journal, not a professional service.

Privacy Policy: No tracking cookies, no analytics, no third-party scripts.
Only essential data (name, email, hashed password) is stored. Local storage is
used for theme and chat state. No data is sold or shared with anyone. Users
may request data removal by contacting G Nihal.

Terms of Use: Personal, educational use only. Content is provided "as is" —
it is a personal learning journal, not a professional service. Code is
MIT-licensed and open source. Content is All Rights Reserved. Terms may be
updated; continued use means acceptance.

Contacting the developer: LinkedIn (linkedin.com/in/gnihal705) is preferred.
Email works too — nihalmohammad705@gmail.com. Response time is usually a few
days because he is a student.

NextraAI is the AI assistant built into this site. It is grounded in
MyCodeNotes content, cites sources, and can switch modes (Normal, Hinglish,
Interview, Code Review) for different learning styles.
"""


def seed():
    db = SessionLocal()
    try:
        # Remove previous version if any
        delete_chunks_for_source(db, "site_info", 0)

        vec = embed_text(SITE_INFO)
        insert_chunk(
            db,
            content=SITE_INFO,
            embedding=vec,
            source_type="site_info",
            source_id=0,
            metadata={
                "source_type": "site_info",
                "title": "About MyCodeNotes, Privacy, Terms, and Contact",
                "url": "/about",
                "field": "about",
            },
        )
        logger.info("✅ Inserted site_info chunk")
    finally:
        db.close()


if __name__ == "__main__":
    seed()