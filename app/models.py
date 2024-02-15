from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Union


class URLIngestModel(BaseModel):
    url: str
    splitter: str = "sentence"
    chunks: int = 512


class TextIngestModel(BaseModel):
    text: str
    source: str
    splitter: str = "sentence"
    chunks: int = 512
    keywords: Union[list[str], None] = None


class FindModel(BaseModel):
    source: Union[str, None] = None
    text: Union[str, None] = None
    score: Union[float, None] = None
    k: Union[int, None] = None


class InteractionModel(BaseModel):
    score: Union[float, None] = None
    k: Optional[int] = Field(None, ge=1, le=25)


class QuestionModel(InteractionModel):
    question: str
    system: Union[str, None] = None
    tables: Union[list[str], None] = None


class RagSqlModel(BaseModel):
    question: str
    tables: Union[list[str], None] = None


class InferenceModel(BaseModel):
    question: str
    system: Union[str, None] = None


class VisionModel(BaseModel):
    question: str
    negative: Union[str, None] = None
    image: Union[str, None] = None
    boost: bool = False


class ChatModel(InteractionModel):
    question: str
    id: Union[str, None] = None


class ProjectModel(BaseModel):
    name: str
    embeddings: Union[str, None] = None
    llm: str
    type: str
    system: Union[str, None] = None
    sandboxed: Union[bool, None] = None
    censorship: Union[str, None] = None
    score: float = 0.3
    k: int = 4
    llm_type: Union[str, None] = None
    llm_privacy: Union[str, None] = None
    vectorstore: Union[str, None] = None
    connection: Union[str, None] = None
    tables: Union[str, None] = None
    model_config = ConfigDict(from_attributes=True)

class LLMModel(BaseModel):
    name: str
    class_name: str
    options: str
    privacy: str
    description: Union[str, None] = None
    type: str
    model_config = ConfigDict(from_attributes=True)

class LLMUpdate(BaseModel):
    class_name: str = None
    options: str = None
    privacy: str = None
    description: str = None
    type: str = None

class ProjectInfo(ProjectModel):
    chunks: int = 0
    llm_type: str
    llm_privacy: str


class UserProject(BaseModel):
    name: str
    model_config = ConfigDict(from_attributes=True)


class User(BaseModel):
    id: int
    username: str
    is_admin: bool = False
    is_private: bool = False
    projects: list[UserProject] = []
    api_key: Union[str, None] = None
    sso: Union[str, None] = None
    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str
    is_admin: bool = False
    is_private: bool = False


class UserUpdate(BaseModel):
    password: str = None
    is_admin: bool = None
    is_private: bool = None
    projects: list[str] = None
    api_key: str = None
    sso: str = None


class ProjectModelUpdate(BaseModel):
    embeddings: Union[str, None] = None
    llm: Union[str, None] = None
    system: Union[str, None] = None
    sandboxed: Union[bool, None] = None
    censorship: Union[str, None] = None
    score: Union[float, None] = None
    k: Union[int, None] = None
    connection: Union[str, None] = None
    tables: Union[str, None] = None


class SourceModel(BaseModel):
    source: str
    keywords: str
    text: str
    score: float
    id: str


class InferenceResponse(BaseModel):
    question: str
    answer: str
    type: str


class QuestionResponse(InferenceResponse):
    sources: Union[list[SourceModel], Union[list[str], None]] = None


class RagSqlResponse(InferenceResponse):
    sources: list[str]


class VisionResponse(QuestionResponse):
    image: Union[str, None] = None


class ChatResponse(QuestionResponse):
    id: str


class IngestResponse(BaseModel):
    source: str
    documents: int
    chunks: int
