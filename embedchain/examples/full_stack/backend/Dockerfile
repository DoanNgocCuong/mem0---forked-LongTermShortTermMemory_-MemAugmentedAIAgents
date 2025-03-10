FROM python:3.11-slim AS backend

WORKDIR /usr/src/app/backend
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 25046

CMD ["sh", "-c", "sed -i 's/port=8000/port=25046/g' server.py && python server.py"]
