import platform
import os
import shutil
import requests
import argparse
import subprocess
import binascii

def generate_ipfs_swarm_key(build_dir):
    try:
        # Create build directory if it doesn't exist
        os.makedirs(build_dir, exist_ok=True)
        
        key = os.urandom(32)
        output = "/key/swarm/psk/1.0.0/\n/base16/\n" + binascii.hexlify(key).decode()
        filename = os.path.join(build_dir, "testswarm.key")
        
        # Check if file already exists
        if os.path.exists(filename):
            print(f"Swarm key file already exists at {filename}")
            return
            
        # Create the file and write content
        with open(filename, "w") as file:
            file.write(output)
        print(f"Successfully created swarm key at {filename}")
            
    except Exception as e:
        print(f"Error in generate_ipfs_swarm_key: {str(e)}")
        raise

def get_os_info():
    os_name = platform.system()
    build_folder = ""

    if os_name == "Linux":
        build_folder = "linux"
    elif os_name == "Windows":
        build_folder = "windows"
    elif os_name == "Darwin":
        build_folder = "mac"
    else:
        print("Unsupported operating system to build Rubix")
        return None, None

    return os_name, build_folder

def download_ipfs_binary(os_name, version, build_dir):
    download_url = ""
    
    if os_name == "Linux":
        download_url = f"https://dist.ipfs.tech/kubo/{version}/kubo_{version}_linux-amd64.tar.gz"
    elif os_name == "Windows":
        download_url = f"https://dist.ipfs.tech/kubo/{version}/kubo_{version}_windows-amd64.zip"
    elif os_name == "Darwin":  # MacOS
        download_url = f"https://dist.ipfs.tech/kubo/{version}/kubo_{version}_darwin-amd64.tar.gz"
    else:
        raise ValueError("Unsupported operating system")

    # Download the IPFS binary archive
    download_path = f"kubo_{version}_{os_name.lower()}-amd64.tar.gz" if os_name != "Windows" else f"kubo_{version}_{os_name.lower()}-amd64.zip"
    print("Downloading IPFS binary...")
    response = requests.get(download_url)
    with open(download_path, "wb") as f:
        f.write(response.content)
    print("Download completed.")

    # Extract the archive
    print("Extracting IPFS binary...")
    if os_name == "Windows":
        # For Windows, we need to use the 'zipfile' module to extract
        import zipfile
        with zipfile.ZipFile(download_path, "r") as zip_ref:
            zip_ref.extractall("kubo")
    else:
        # For Linux and MacOS, we use tar
        import tarfile
        with tarfile.open(download_path, "r:gz" if os_name != "Darwin" else "r") as tar_ref:
            tar_ref.extractall("kubo")
    print("Extraction completed.")

    # Check the contents of the kubo directory
    print("Contents of kubo directory:")
    for item in os.listdir("kubo"):
        print(item)

    # Move IPFS binary to the appropriate folder
    print("Moving IPFS binary...")
    
    ipfs_bin_name = "ipfs"
    if os_name == "Windows":
        ipfs_bin_name = "ipfs.exe"

    src_file = os.path.join("kubo", "kubo", ipfs_bin_name)
    dest_dir = os.path.join(build_dir, ipfs_bin_name)
    if os.path.exists(src_file):
        shutil.move(src_file, dest_dir)
        print("IPFS binary moved to", dest_dir)

        # Check if the file is present at the destination
        dest_file = os.path.join(dest_dir)
        if not os.path.exists(dest_file):
            raise FileNotFoundError("IPFS binary not found at the destination after move operation.")
    else:
        raise FileNotFoundError("Installed IPFS binary file does not exist.")

    # Clean up
    os.remove(download_path)
    shutil.rmtree("kubo")
    print("\nIPFS has been installed succesfully.")

def clone_and_build(repo_url, branch_name, os_name):
    try:
        # Clone the repository
        print(f"Cloning repository from {repo_url}...")
        subprocess.run(["git", "clone", repo_url], check=True)

        # Extract the repo name from the URL
        repo_name = os.path.basename(repo_url).replace(".git", "")

        # Change directory into the cloned repository
        os.chdir(repo_name)
        print(f"Changed directory to {repo_name}")

        # Checkout the specified branch
        print(f"Checking out branch {branch_name}...")
        subprocess.run(["git", "checkout", branch_name], check=True)

        # Determine the build command based on the operating system
        if os_name == "Windows":
            build_command = ["make", "compile-windows"]
        elif os_name == "Linux":
            build_command = ["make", "compile-linux"]
        elif os_name == "Darwin":  # macOS
            build_command = ["make", "compile-mac"]
        else:
            raise ValueError(f"Unsupported OS: {os_name}")

        # Run the build command
        print(f"Running build command: {' '.join(build_command)}...")
        subprocess.run(build_command, check=True)
        
        print("Build completed successfully.")

    except subprocess.CalledProcessError as e:
        print(f"Command '{' '.join(e.cmd)}' failed with return code {e.returncode}.")
    except Exception as e:
        print(f"An error occurred: {e}")
