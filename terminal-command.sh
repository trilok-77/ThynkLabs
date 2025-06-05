# First, ensure all changes are committed
git add .
git commit -m "Update codebase to match local version"

# Create a new orphan branch with your current content
git checkout --orphan temp_branch

# Add all files to this new branch
git add .
git commit -m "Fresh start with current files only"

# Delete the main branch and rename temp_branch to main
git branch -D main
git branch -m main

# Force push the new main branch to remote
git push -f origin main


