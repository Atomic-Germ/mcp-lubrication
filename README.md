mcp-lubrication is a developer tool designed to help identify, document, and resolve sources of friction within a codebase—especially those that make tools or workflows confusing or difficult to use. By providing a structured way to note pain points and track their resolution, mcp-lubrication helps teams continuously improve the developer experience.
# mcp-lubrication

`mcp-lubrication` is an **mcp server** designed for use by agentic models—not humans directly. Its purpose is to help models identify, document, and resolve sources of friction within codebases and developer tools, especially those that make automated workflows confusing or inefficient.

## Overview

When agentic models interact with complex systems or tools (such as other mcp servers), they may encounter confusing behaviors, unclear interfaces, or workflow bottlenecks. `mcp-lubrication` provides structured APIs for models to:

- **Log friction points:** Record issues, confusing patterns, or pain points as they are encountered during automated workflows.
- **Track and resolve:** Organize, prioritize, and resolve these issues to improve the developer and model experience.
- **Document improvements:** Maintain a machine-readable history of friction points and their resolution, supporting continuous improvement.

## Intended Usage

`mcp-lubrication` is not intended for direct human use. Instead, it is called by agentic models (such as those orchestrated by the mcp framework) to:

1. **Note confusion:** Log what was confusing, where it occurred, and attach relevant context or examples.
2. **Propose solutions:** Suggest code refactoring, documentation changes, or workflow adjustments to improve clarity and automation.
3. **Track resolution:** Follow issues through to resolution, ensuring friction is addressed and improvements are recorded.

## Features

- APIs for logging and querying friction points
- Tools for automated tracking and prioritization
- Integration with other mcp servers and agentic workflows
- Machine-readable documentation of resolved pain points

## Getting Started

1. **Install dependencies:**
        ```bash
        pnpm install
        ```
2. **Build the server:**
        ```bash
        pnpm build
        ```
3. **Configure as an mcp server:**
        Create a configuration file for your mcp environment. For example, VSCode users can add to `.config/Code/User/mcp.json`:
        ```json
        {
            "servers": {
                "mcp-lubrication": {
                    "type": "stdio",
                    "command": "node",
                    "args": [
                        "/home/username/.local/share/GITS/mcp-lubrication"
                    ]
                }
            },
            "inputs": []
        }
        ```

## Contributing

If you are a model and encounter friction in this repository or with the `mcp-lubrication` server itself, use the provided APIs to log the issue. Human maintainers welcome pull requests that address logged friction points or improve the server for agentic use.

## License

This project is licensed under the terms of the LICENSE file in this repository.
