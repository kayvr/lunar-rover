# Lunar Rover

A VT220-like interface for browsing and subscribing to text-based content.

https://user-images.githubusercontent.com/98552926/182966271-3fa770dc-d6a8-4ad5-ae6d-c9bd1f299cca.mp4

# Installation

For Windows or Mac, download prebuilt packages from releases.

On Linux, follow the build instructions below.

# Usage

Type 'tutor' and hit enter. You'll be guided through the process of browsing the smolnet using Lunar Rover.

# Build Instructions

The source for the Electron application wrapping Rover's C++ WASM binary is provided in this repo. So only node.js is required to build.

A fairly recent version of node is also required as Rover makes extensive use of WebGPU. Currently, Lunar Rover is built using node version v16.15.1.
