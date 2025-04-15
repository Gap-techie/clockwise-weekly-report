#!/bin/bash

# Function to list directory contents with proper indentation
list_dir() {
    local dir="$1"
    local indent="$2"
    local last="$3"

    # Print current directory name
    if [ "$last" = "true" ]; then
        echo "${indent}└── $(basename "$dir")/"
    else
        echo "${indent}├── $(basename "$dir")/"
    fi

    # Update indentation for next level
    if [ "$last" = "true" ]; then
        indent="${indent}    "
    else
        indent="${indent}│   "
    fi

    # Get all files and directories, excluding specified folders
    local items=()
    while IFS= read -r item; do
        items+=("$item")
    done < <(find "$dir" -maxdepth 1 -mindepth 1 ! -name "node_modules" ! -name ".next" ! -name ".git" | sort)

    # Process each item
    local count=${#items[@]}
    local i=0
    for item in "${items[@]}"; do
        i=$((i + 1))
        if [ -d "$item" ]; then
            if [ $i -eq $count ]; then
                list_dir "$item" "$indent" "true"
            else
                list_dir "$item" "$indent" "false"
            fi
        else
            if [ $i -eq $count ]; then
                echo "${indent}└── $(basename "$item")"
            else
                echo "${indent}├── $(basename "$item")"
            fi
        fi
    done
}

# Start from the current directory
echo "$(basename "$(pwd)")/"
list_dir "$(pwd)" "" "true"