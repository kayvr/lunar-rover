# Lunar Rover

A VT220-like client interface for browsing and subscribing to text-based content. Supports the gemini and spartan protocols.

https://user-images.githubusercontent.com/98552926/182966271-3fa770dc-d6a8-4ad5-ae6d-c9bd1f299cca.mp4

# Installation

For Windows or Mac, download prebuilt packages from releases.

On Linux, follow the build instructions below.

# Usage

Type 'tutor' and hit enter. You'll be guided through the process of browsing the smolnet using Lunar Rover.

# Build Instructions

Install node.js. Currently, Lunar Rover is built using node version v16.15.1.

* npm install
* npm run make

Or just use `npm start` to run the code in-place without building a binary.

Note that the core of Lunar Rover is a C++ WASM module that uses WebGPU. This WASM module is pre-built and included inside this repository.

## Rebuilding package.json from scratch

* npm init
* npm install electron
* npm install @electron-forge/cli
* npx electron-forge import


