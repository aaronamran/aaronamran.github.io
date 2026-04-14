# CodeChef Problems - Quick Guide

## Structure
```
codechef/
├── index.html          (lists all topics: Arrays, Strings, etc.)
├── arrays/
│   ├── index.html      (lists all array problems)
│   ├── search-element.html
│   └── [more problems...]
├── strings/
│   └── ...
└── sorting/
    └── ...
```

## Adding a New Problem

### Step 1: Create the problem file
Copy `arrays/search-element.html` and rename it (e.g., `find-largest.html`)

### Step 2: Update the problem content
Edit the new file and change:
- Title
- Problem description
- Solutions
- Date

### Step 3: Add to topic index
Open `arrays/index.html` and add a new entry:
```html
<a class="post-row" href="find-largest.html">
  <div class="post-body">
    <h2 class="post-title">Find Largest Element</h2>
    <p class="post-excerpt">Description here...</p>
    <div class="post-meta"><span class="post-prog">Arrays &middot; Easy &middot; April 2026</span></div>
  </div>
</a>
```

### Step 4: Update count
Update the solved count in:
- `arrays/index.html` (sidebar: "2 solved")
- `codechef/index.html` (problem meta: "2 / 56 problems solved")

## Adding a New Topic

### Step 1: Create folder
Create `codechef/strings/` folder

### Step 2: Copy arrays/index.html
Copy to `strings/index.html` and update:
- Title to "Strings Problems"
- Topic tags
- Problem count

### Step 3: Add to main index
Open `codechef/index.html` and add:
```html
<a class="post-row" href="strings/">
  <div class="post-body">
    <h2 class="post-title">Strings</h2>
    <p class="post-excerpt">Description...</p>
    <div class="post-meta"><span class="post-prog">0 / 42 problems solved</span></div>
  </div>
</a>
```

## Benefits
✅ Fast loading (static HTML)
✅ Works offline
✅ Easy to edit (just copy/paste HTML)
✅ No build process needed
✅ Mobile-friendly
✅ Low resource usage
