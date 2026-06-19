class MockTranscriptionService:
    def transcribe(self, file) -> str:
        filename = getattr(file, "filename", "audio")
        return f"녹취 내용이 텍스트로 변환되었습니다. 파일명: {filename}. 민원인이 반복적인 항의와 압박성 발언을 했습니다."


def transcribe(file) -> str:
    return MockTranscriptionService().transcribe(file)
