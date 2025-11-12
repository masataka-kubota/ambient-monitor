# main, develop branches protection rules
prohibit_protected_branch_commits() {
  current_branch=$(git symbolic-ref --short HEAD)
  if [ "$current_branch" = "main" ] || [ "$current_branch" = "develop" ]; then
    echo "⚠️ Warning: Direct commits on the 'main' or 'develop' branches are prohibited."
    echo "➡️ Please switch to a feature/fix branch and open a PR."
    exit 1
  fi
}

# Get base branch for comparing diff
get_base_branch() {
  current_branch=$(git symbolic-ref --short HEAD)

  if [ "$current_branch" = "develop" ]; then
    # develop -> main
    echo "origin/main"
  else
    # feat/fix/etc -> develop
    echo "origin/develop"
  fi
}
