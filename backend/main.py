import os
import re
import time
import zipfile
import tarfile
import asyncio
import mimetypes
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, BigInteger, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
import uvicorn

# Document processing libraries
try:
    from docx import Document as DocxDocument
except ImportError:
    DocxDocument = None

try:
    from openpyxl import load_workbook
except ImportError:
    load_workbook = None

try:
    from pptx import Presentation
except ImportError:
    Presentation = None

try:
    from odf.opendocument import load as odf_load
    from odf.text import P as OdfP
except ImportError:
    odf_load = None
    OdfP = None


# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/filesearch")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class SearchSession(Base):
    __tablename__ = "search_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    search_term = Column(String(500), nullable=False)
    search_path = Column(String(1000), nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime)
    total_files_searched = Column(Integer, default=0)
    total_matches = Column(Integer, default=0)
    status = Column(String(50), default="running")
    
    results = relationship("SearchResult", back_populates="session", cascade="all, delete-orphan")

class SearchResult(Base):
    __tablename__ = "search_results"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("search_sessions.id"))
    file_path = Column(String(2000), nullable=False)
    file_name = Column(String(500), nullable=False)
    file_size = Column(BigInteger)
    file_type = Column(String(50))
    match_count = Column(Integer, default=0)
    is_zip_file = Column(Boolean, default=False)
    zip_parent_path = Column(String(2000))
    found_at = Column(DateTime, default=datetime.utcnow)
    preview_text = Column(Text)
    
    session = relationship("SearchSession", back_populates="results")
    matches = relationship("MatchDetail", back_populates="result", cascade="all, delete-orphan")

class MatchDetail(Base):
    __tablename__ = "match_details"
    
    id = Column(Integer, primary_key=True, index=True)
    result_id = Column(Integer, ForeignKey("search_results.id"))
    line_number = Column(Integer)
    line_content = Column(Text)
    match_position = Column(Integer)
    context_before = Column(Text)
    context_after = Column(Text)
    
    result = relationship("SearchResult", back_populates="matches")

# Pydantic models
class SearchRequest(BaseModel):
    search_term: str
    search_path: str = "/Users/vndr"
    case_sensitive: bool = False
    include_zip_files: bool = True

class SearchSessionResponse(BaseModel):
    id: int
    search_term: str
    search_path: str
    start_time: datetime
    end_time: Optional[datetime]
    total_files_searched: int
    total_matches: int
    status: str

class SearchResultResponse(BaseModel):
    id: int
    file_path: str
    file_name: str
    file_size: Optional[int]
    file_type: Optional[str]
    match_count: int
    is_zip_file: bool
    zip_parent_path: Optional[str]
    preview_text: Optional[str]

class MatchDetailResponse(BaseModel):
    line_number: Optional[int]
    line_content: str
    match_position: int
    context_before: Optional[str]
    context_after: Optional[str]

# File search engine
class FileSearchEngine:
    def __init__(self, db_session: Session):
        self.db_session = db_session
        self.supported_text_extensions = {
            '.txt', '.py', '.js', '.ts', '.html', '.css', '.json', '.xml', '.yml', '.yaml',
            '.md', '.rst', '.log', '.cfg', '.conf', '.ini', '.properties', '.sql',
            '.sh', '.bash', '.zsh', '.ps1', '.bat', '.cmd', '.dockerfile', '.makefile',
            '.cpp', '.c', '.h', '.hpp', '.java', '.cs', '.php', '.rb', '.go', '.rs',
            '.swift', '.kt', '.scala', '.clj', '.pl', '.r', '.m', '.mm', '.lua', '.vim'
        }
    
    async def search_files(self, request: SearchRequest, websocket: Optional[WebSocket] = None) -> int:
        """Main search function that returns session_id"""
        # Create search session
        session = SearchSession(
            search_term=request.search_term,
            search_path=request.search_path,
            status="running"
        )
        self.db_session.add(session)
        self.db_session.commit()
        self.db_session.refresh(session)
        
        session_id = session.id
        start_time = time.time()
        
        try:
            search_pattern = self._create_search_pattern(request.search_term, request.case_sensitive)
            # Convert local path to Docker mounted path
            local_path = request.search_path
            base_path = "/app/host_root"
            full_path = os.path.normpath(os.path.join(base_path, local_path))
            # Verify normalized path is within allowed base directory
            if not full_path.startswith(base_path):
                raise HTTPException(status_code=400, detail="Access to the requested path is not allowed.")
            search_path = Path(full_path)
            
            if not search_path.exists():
                raise HTTPException(status_code=400, detail=f"Search path does not exist: {local_path}")
            
            total_files = 0
            total_matches = 0
            
            async for file_path in self._walk_directory(search_path):
                if websocket:
                    try:
                        await websocket.send_json({
                            "type": "progress",
                            "current_file": str(file_path).replace('/app/host_root', ''),  # Show original local path
                            "files_searched": total_files
                        })
                    except Exception:  # nosec B110 - Catch all websocket errors
                        break  # WebSocket disconnected
                
                total_files += 1
                
                try:
                    file_ext = file_path.suffix.lower()
                    
                    # Handle archive files
                    if file_ext == '.zip' and request.include_zip_files:
                        matches = await self._search_zip_file(file_path, search_pattern, session_id)
                        total_matches += matches
                    elif file_ext in {'.tar', '.gz', '.bz2', '.tgz', '.tar.gz', '.tar.bz2'} and request.include_zip_files:
                        matches = await self._search_tar_file(file_path, search_pattern, session_id)
                        total_matches += matches
                    # Handle Microsoft Office documents
                    elif file_ext in {'.docx', '.doc'}:
                        matches = await self._search_docx_file(file_path, search_pattern, session_id)
                        total_matches += matches
                    elif file_ext in {'.xlsx', '.xls'}:
                        matches = await self._search_xlsx_file(file_path, search_pattern, session_id)
                        total_matches += matches
                    elif file_ext in {'.pptx', '.ppt'}:
                        matches = await self._search_pptx_file(file_path, search_pattern, session_id)
                        total_matches += matches
                    # Handle LibreOffice/OpenDocument files
                    elif file_ext in {'.odt', '.ods', '.odp'}:
                        matches = await self._search_odf_file(file_path, search_pattern, session_id)
                        total_matches += matches
                    # Handle regular text files
                    elif self._is_text_file(file_path):
                        matches = await self._search_text_file(file_path, search_pattern, session_id)
                        total_matches += matches
                        
                except Exception as e:
                    print(f"Error searching file {file_path}: {e}")
                    continue
                
                # Update progress every 100 files
                if total_files % 100 == 0:
                    session.total_files_searched = total_files
                    session.total_matches = total_matches
                    self.db_session.commit()
            
            # Finalize session
            end_time = time.time()
            session.total_files_searched = total_files
            session.total_matches = total_matches
            session.end_time = datetime.utcnow()
            session.status = "completed"
            self.db_session.commit()
            
            if websocket:
                try:
                    await websocket.send_json({
                        "type": "completed",
                        "session_id": session_id,
                        "total_files": total_files,
                        "total_matches": total_matches,
                        "duration": end_time - start_time
                    })
                except Exception:  # nosec B110 - Catch all websocket errors
                    pass
            
            return session_id
            
        except Exception as e:
            session.status = "error"
            self.db_session.commit()
            raise e
    
    def _create_search_pattern(self, search_term: str, case_sensitive: bool):
        flags = 0 if case_sensitive else re.IGNORECASE
        return re.compile(re.escape(search_term), flags)
    
    async def _walk_directory(self, path: Path) -> AsyncGenerator[Path, None]:
        """Async generator to walk through directory"""
        for root, dirs, files in os.walk(path):
            # Skip hidden directories and common non-searchable directories
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in {'node_modules', '__pycache__', '.git'}]
            
            for file in files:
                if not file.startswith('.'):
                    yield Path(root) / file
    
    def _is_text_file(self, file_path: Path) -> bool:
        """Check if file is likely to be a text file"""
        if file_path.suffix.lower() in self.supported_text_extensions:
            return True
        
        # Check MIME type
        mime_type, _ = mimetypes.guess_type(str(file_path))
        if mime_type and mime_type.startswith('text'):
            return True
        
        # For unknown extensions, try to read a small portion to check if it's text
        try:
            if file_path.stat().st_size > 10 * 1024 * 1024:  # Skip files larger than 10MB
                return False
            
            with open(file_path, 'rb') as f:
                chunk = f.read(1024)
                try:
                    chunk.decode('utf-8')
                    return True
                except UnicodeDecodeError:
                    return False
        except Exception:  # nosec B110 - Catch all file access errors
            return False
    
    async def _search_text_file(self, file_path: Path, pattern: re.Pattern, session_id: int) -> int:
        """Search for pattern in a text file"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            matches = list(pattern.finditer(content))
            if not matches:
                return 0
            
            # Create search result
            result = SearchResult(
                session_id=session_id,
                file_path=str(file_path).replace('/app/host_root', ''),  # Show original local path
                file_name=file_path.name,
                file_size=file_path.stat().st_size,
                file_type=file_path.suffix.lower(),
                match_count=len(matches),
                is_zip_file=False,
                preview_text=self._create_preview(content, matches[0].start())
            )
            self.db_session.add(result)
            self.db_session.flush()
            
            # Add match details
            lines = content.split('\n')
            for match in matches[:10]:  # Limit to first 10 matches per file
                line_num = content[:match.start()].count('\n') + 1
                line_content = lines[line_num - 1] if line_num <= len(lines) else ""
                
                match_detail = MatchDetail(
                    result_id=result.id,
                    line_number=line_num,
                    line_content=line_content,
                    match_position=match.start() - content.rfind('\n', 0, match.start()) - 1,
                    context_before='\n'.join(lines[max(0, line_num-3):line_num-1]),
                    context_after='\n'.join(lines[line_num:min(len(lines), line_num+2)])
                )
                self.db_session.add(match_detail)
            
            self.db_session.commit()
            return len(matches)
            
        except Exception as e:
            print(f"Error reading file {file_path}: {e}")
            return 0
    
    async def _search_zip_file(self, zip_path: Path, pattern: re.Pattern, session_id: int) -> int:
        """Search for pattern inside zip files"""
        total_matches = 0
        
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_file:
                for file_info in zip_file.filelist:
                    if file_info.is_dir():
                        continue
                    
                    file_name = Path(file_info.filename).name
                    file_ext = Path(file_info.filename).suffix.lower()
                    
                    if file_ext not in self.supported_text_extensions:
                        continue
                    
                    try:
                        with zip_file.open(file_info) as f:
                            content = f.read().decode('utf-8', errors='ignore')
                        
                        matches = list(pattern.finditer(content))
                        if matches:
                            result = SearchResult(
                                session_id=session_id,
                                file_path=file_info.filename,
                                file_name=file_name,
                                file_size=file_info.file_size,
                                file_type=file_ext,
                                match_count=len(matches),
                                is_zip_file=True,
                                zip_parent_path=str(zip_path).replace('/app/host_root', ''),  # Show original local path
                                preview_text=self._create_preview(content, matches[0].start())
                            )
                            self.db_session.add(result)
                            self.db_session.flush()
                            
                            # Add match details (limit to first 5 matches in zip files)
                            lines = content.split('\n')
                            for match in matches[:5]:
                                line_num = content[:match.start()].count('\n') + 1
                                line_content = lines[line_num - 1] if line_num <= len(lines) else ""
                                
                                match_detail = MatchDetail(
                                    result_id=result.id,
                                    line_number=line_num,
                                    line_content=line_content,
                                    match_position=match.start() - content.rfind('\n', 0, match.start()) - 1
                                )
                                self.db_session.add(match_detail)
                            
                            total_matches += len(matches)
                    
                    except Exception as e:
                        print(f"Error reading {file_info.filename} from {zip_path}: {e}")
                        continue
                
                self.db_session.commit()
                
        except Exception as e:
            print(f"Error reading zip file {zip_path}: {e}")
        
        return total_matches
    
    async def _search_tar_file(self, tar_path: Path, pattern: re.Pattern, session_id: int) -> int:
        """Search for pattern inside tar/tar.gz/tar.bz2 files"""
        total_matches = 0
        
        try:
            # Determine compression mode
            if tar_path.suffix in {'.gz', '.tgz'} or str(tar_path).endswith('.tar.gz'):
                mode = 'r:gz'
            elif tar_path.suffix in {'.bz2'} or str(tar_path).endswith('.tar.bz2'):
                mode = 'r:bz2'
            else:
                mode = 'r'
            
            with tarfile.open(tar_path, mode) as tar_file:
                for member in tar_file.getmembers():
                    if not member.isfile():
                        continue
                    
                    file_name = Path(member.name).name
                    file_ext = Path(member.name).suffix.lower()
                    
                    if file_ext not in self.supported_text_extensions:
                        continue
                    
                    try:
                        f = tar_file.extractfile(member)
                        if f is None:
                            continue
                        
                        content = f.read().decode('utf-8', errors='ignore')
                        f.close()
                        
                        matches = list(pattern.finditer(content))
                        if matches:
                            result = SearchResult(
                                session_id=session_id,
                                file_path=member.name,
                                file_name=file_name,
                                file_size=member.size,
                                file_type=file_ext,
                                match_count=len(matches),
                                is_zip_file=True,
                                zip_parent_path=str(tar_path).replace('/app/host_root', ''),
                                preview_text=self._create_preview(content, matches[0].start())
                            )
                            self.db_session.add(result)
                            self.db_session.flush()
                            
                            # Add match details (limit to first 5 matches)
                            lines = content.split('\n')
                            for match in matches[:5]:
                                line_num = content[:match.start()].count('\n') + 1
                                line_content = lines[line_num - 1] if line_num <= len(lines) else ""
                                
                                match_detail = MatchDetail(
                                    result_id=result.id,
                                    line_number=line_num,
                                    line_content=line_content,
                                    match_position=match.start() - content.rfind('\n', 0, match.start()) - 1
                                )
                                self.db_session.add(match_detail)
                            
                            total_matches += len(matches)
                    
                    except Exception as e:
                        print(f"Error reading {member.name} from {tar_path}: {e}")
                        continue
                
                self.db_session.commit()
                
        except Exception as e:
            print(f"Error reading tar file {tar_path}: {e}")
        
        return total_matches
    
    async def _search_docx_file(self, docx_path: Path, pattern: re.Pattern, session_id: int) -> int:
        """Search for pattern inside DOCX files"""
        if DocxDocument is None:
            return 0
        
        total_matches = 0
        try:
            doc = DocxDocument(str(docx_path))
            content = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
            
            matches = list(pattern.finditer(content))
            if matches:
                result = SearchResult(
                    session_id=session_id,
                    file_path=str(docx_path).replace('/app/host_root', ''),
                    file_name=docx_path.name,
                    file_size=docx_path.stat().st_size,
                    file_type=docx_path.suffix.lower(),
                    match_count=len(matches),
                    is_zip_file=False,
                    preview_text=self._create_preview(content, matches[0].start())
                )
                self.db_session.add(result)
                self.db_session.flush()
                
                # Add match details
                for match in matches[:10]:
                    line_num = content[:match.start()].count('\n') + 1
                    lines = content.split('\n')
                    line_content = lines[line_num - 1] if line_num <= len(lines) else ""
                    
                    match_detail = MatchDetail(
                        result_id=result.id,
                        line_number=line_num,
                        line_content=line_content,
                        match_position=match.start() - content.rfind('\n', 0, match.start()) - 1
                    )
                    self.db_session.add(match_detail)
                
                total_matches = len(matches)
                self.db_session.commit()
                
        except Exception as e:
            print(f"Error reading DOCX file {docx_path}: {e}")
        
        return total_matches
    
    async def _search_xlsx_file(self, xlsx_path: Path, pattern: re.Pattern, session_id: int) -> int:
        """Search for pattern inside XLSX files"""
        if load_workbook is None:
            return 0
        
        total_matches = 0
        try:
            workbook = load_workbook(str(xlsx_path), read_only=True, data_only=True)
            content_parts = []
            
            for sheet in workbook.worksheets:
                for row in sheet.iter_rows(values_only=True):
                    row_text = ' '.join([str(cell) if cell is not None else '' for cell in row])
                    if row_text.strip():
                        content_parts.append(row_text)
            
            content = '\n'.join(content_parts)
            workbook.close()
            
            matches = list(pattern.finditer(content))
            if matches:
                result = SearchResult(
                    session_id=session_id,
                    file_path=str(xlsx_path).replace('/app/host_root', ''),
                    file_name=xlsx_path.name,
                    file_size=xlsx_path.stat().st_size,
                    file_type=xlsx_path.suffix.lower(),
                    match_count=len(matches),
                    is_zip_file=False,
                    preview_text=self._create_preview(content, matches[0].start())
                )
                self.db_session.add(result)
                self.db_session.flush()
                
                # Add match details
                for match in matches[:10]:
                    line_num = content[:match.start()].count('\n') + 1
                    lines = content.split('\n')
                    line_content = lines[line_num - 1] if line_num <= len(lines) else ""
                    
                    match_detail = MatchDetail(
                        result_id=result.id,
                        line_number=line_num,
                        line_content=line_content,
                        match_position=match.start() - content.rfind('\n', 0, match.start()) - 1
                    )
                    self.db_session.add(match_detail)
                
                total_matches = len(matches)
                self.db_session.commit()
                
        except Exception as e:
            print(f"Error reading XLSX file {xlsx_path}: {e}")
        
        return total_matches
    
    async def _search_pptx_file(self, pptx_path: Path, pattern: re.Pattern, session_id: int) -> int:
        """Search for pattern inside PPTX files"""
        if Presentation is None:
            return 0
        
        total_matches = 0
        try:
            prs = Presentation(str(pptx_path))
            content_parts = []
            
            for slide in prs.slides:
                for shape in slide.shapes:
                    if hasattr(shape, "text"):
                        content_parts.append(shape.text)
            
            content = '\n'.join(content_parts)
            
            matches = list(pattern.finditer(content))
            if matches:
                result = SearchResult(
                    session_id=session_id,
                    file_path=str(pptx_path).replace('/app/host_root', ''),
                    file_name=pptx_path.name,
                    file_size=pptx_path.stat().st_size,
                    file_type=pptx_path.suffix.lower(),
                    match_count=len(matches),
                    is_zip_file=False,
                    preview_text=self._create_preview(content, matches[0].start())
                )
                self.db_session.add(result)
                self.db_session.flush()
                
                # Add match details
                for match in matches[:10]:
                    line_num = content[:match.start()].count('\n') + 1
                    lines = content.split('\n')
                    line_content = lines[line_num - 1] if line_num <= len(lines) else ""
                    
                    match_detail = MatchDetail(
                        result_id=result.id,
                        line_number=line_num,
                        line_content=line_content,
                        match_position=match.start() - content.rfind('\n', 0, match.start()) - 1
                    )
                    self.db_session.add(match_detail)
                
                total_matches = len(matches)
                self.db_session.commit()
                
        except Exception as e:
            print(f"Error reading PPTX file {pptx_path}: {e}")
        
        return total_matches
    
    async def _search_odf_file(self, odf_path: Path, pattern: re.Pattern, session_id: int) -> int:
        """Search for pattern inside ODF files (ODT, ODS, ODP)"""
        if odf_load is None or OdfP is None:
            return 0
        
        total_matches = 0
        try:
            doc = odf_load(str(odf_path))
            content_parts = []
            
            # Extract text from all paragraph elements
            for paragraph in doc.getElementsByType(OdfP):
                text = str(paragraph)
                if text.strip():
                    content_parts.append(text)
            
            content = '\n'.join(content_parts)
            
            matches = list(pattern.finditer(content))
            if matches:
                result = SearchResult(
                    session_id=session_id,
                    file_path=str(odf_path).replace('/app/host_root', ''),
                    file_name=odf_path.name,
                    file_size=odf_path.stat().st_size,
                    file_type=odf_path.suffix.lower(),
                    match_count=len(matches),
                    is_zip_file=False,
                    preview_text=self._create_preview(content, matches[0].start())
                )
                self.db_session.add(result)
                self.db_session.flush()
                
                # Add match details
                for match in matches[:10]:
                    line_num = content[:match.start()].count('\n') + 1
                    lines = content.split('\n')
                    line_content = lines[line_num - 1] if line_num <= len(lines) else ""
                    
                    match_detail = MatchDetail(
                        result_id=result.id,
                        line_number=line_num,
                        line_content=line_content,
                        match_position=match.start() - content.rfind('\n', 0, match.start()) - 1
                    )
                    self.db_session.add(match_detail)
                
                total_matches = len(matches)
                self.db_session.commit()
                
        except Exception as e:
            print(f"Error reading ODF file {odf_path}: {e}")
        
        return total_matches
    
    def _create_preview(self, content: str, match_position: int, context_length: int = 200) -> str:
        """Create a preview of the content around the match"""
        start = max(0, match_position - context_length // 2)
        end = min(len(content), match_position + context_length // 2)
        preview = content[start:end]
        
        if start > 0:
            preview = "..." + preview
        if end < len(content):
            preview = preview + "..."
        
        return preview

# WebSocket manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

# FastAPI app
app = FastAPI(title="File Search API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/search", response_model=dict)
async def start_search(request: SearchRequest):
    """Start a new search"""
    db = SessionLocal()
    try:
        search_engine = FileSearchEngine(db)
        session_id = await search_engine.search_files(request)
        return {"session_id": session_id, "status": "started"}
    finally:
        db.close()

@app.websocket("/ws/search")
async def websocket_search(websocket: WebSocket):
    """WebSocket endpoint for real-time search"""
    await manager.connect(websocket)
    try:
        # Wait for search request
        data = await websocket.receive_json()
        request = SearchRequest(**data)
        
        db = SessionLocal()
        try:
            search_engine = FileSearchEngine(db)
            session_id = await search_engine.search_files(request, websocket)
        finally:
            db.close()
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        await websocket.send_json({"type": "error", "message": str(e)})

@app.get("/sessions", response_model=List[SearchSessionResponse])
async def get_search_sessions():
    """Get all search sessions"""
    db = SessionLocal()
    try:
        sessions = db.query(SearchSession).order_by(SearchSession.start_time.desc()).all()
        return sessions
    finally:
        db.close()

@app.get("/sessions/{session_id}", response_model=SearchSessionResponse)
async def get_search_session(session_id: int):
    """Get a specific search session"""
    db = SessionLocal()
    try:
        session = db.query(SearchSession).filter(SearchSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    finally:
        db.close()

@app.get("/sessions/{session_id}/results", response_model=List[SearchResultResponse])
async def get_search_results(session_id: int, limit: int = 100, offset: int = 0):
    """Get search results for a session"""
    db = SessionLocal()
    try:
        results = db.query(SearchResult).filter(
            SearchResult.session_id == session_id
        ).offset(offset).limit(limit).all()
        return results
    finally:
        db.close()

@app.get("/results/{result_id}/matches", response_model=List[MatchDetailResponse])
async def get_match_details(result_id: int):
    """Get match details for a specific result"""
    db = SessionLocal()
    try:
        matches = db.query(MatchDetail).filter(MatchDetail.result_id == result_id).all()
        return matches
    finally:
        db.close()

@app.delete("/sessions/{session_id}")
async def delete_search_session(session_id: int):
    """Delete a search session and all its results"""
    db = SessionLocal()
    try:
        session = db.query(SearchSession).filter(SearchSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        db.delete(session)
        db.commit()
        return {"message": "Session deleted successfully"}
    finally:
        db.close()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

if __name__ == "__main__":
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Run the application
    uvicorn.run(app, host="0.0.0.0", port=8000)  # nosec B104 - Binding to all interfaces is required for Docker