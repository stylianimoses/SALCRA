import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Extract the Logos section
logos_match = re.search(r'(<div class="flex items-center space-x-6">.*?</a>\s*</div>)', html, re.DOTALL)
logos_html = logos_match.group(1)

# Extract the Mobile menu button
mobile_btn_match = re.search(r'(<!-- Mobile menu button -->\s*<div class="flex md:hidden">.*?</div>)', html, re.DOTALL)
mobile_btn_html = mobile_btn_match.group(1).replace('md:hidden', 'lg:hidden ml-auto') # Increase breakpoint to lg since nav is wide

# Extract the UL of the Navigation Menu
nav_ul_match = re.search(r'(<ul class="flex space-x-8 py-3 items-center">.*?</ul>)', html, re.DOTALL)
nav_ul_html = nav_ul_match.group(1)
# Make text smaller and spacing slightly tighter so it fits next to the logo
nav_ul_html = nav_ul_html.replace('flex space-x-8 py-3 items-center', 'flex space-x-4 lg:space-x-6 py-3 items-center text-[11px] lg:text-[13px] font-medium')

# The new Main Header Row
new_main_row = f"""
      <div class="flex items-center justify-between pb-4 pt-2">
        <!-- Logos on the left side -->
        {logos_html.replace('class="flex items-center space-x-6"', 'class="flex items-center space-x-6 shrink-0"')}

        <!-- Desktop Navigation Menu -->
        <nav class="hidden lg:flex items-center flex-1 justify-end ml-4" aria-label="Main Navigation">
          {nav_ul_html}
        </nav>

        {mobile_btn_html}
      </div>
"""

# Now we need to replace the old sections
# 1. Remove the old mobile btn and logos and the div that wraps them
old_main_row_match = re.search(r'<div class="flex items-center justify-between pb-4">.*?<!-- Mobile menu button -->.*?</div>\s*</div>', html, re.DOTALL)

# 2. Remove the old nav
old_nav_match = re.search(r'<!-- Centered Navigation Menu -->\s*<nav class="hidden md:flex bg-white shadow-sm".*?</nav>', html, re.DOTALL)

# Replace the old main row with the new one
html = html.replace(old_main_row_match.group(0), new_main_row + '\n    </div>')

# Remove the old nav entirely
html = html.replace(old_nav_match.group(0), '')

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Restructured header successfully.")
