FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    build-essential \
    make \
    tmux \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Go 1.22
RUN wget https://go.dev/dl/go1.22.0.linux-amd64.tar.gz \
    && tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz \
    && rm go1.22.0.linux-amd64.tar.gz

# Add Go to PATH
ENV PATH=$PATH:/usr/local/go/bin
ENV GOPATH=/go
ENV PATH=$PATH:$GOPATH/bin

# Set Python to unbuffered mode
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Copy the entire project
COPY . .

# Install Python dependencies (if any requirements.txt exists)
RUN if [ -f requirements.txt ]; then pip3 install -r requirements.txt; fi

# Install requests module for Python
RUN pip3 install requests

# Expose port
EXPOSE 20005

# Create an entrypoint script
RUN echo '#!/bin/bash\n\
python3 -u scripts/run.py\n\
# Keep container running\n\
tail -f /dev/null' > /app/entrypoint.sh \
&& chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
