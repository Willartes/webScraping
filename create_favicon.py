from cairosvg import svg2png
from PIL import Image
import io

# Lê o arquivo SVG
with open('favicon.svg', 'r') as f:
    svg_data = f.read()

# Converte SVG para PNG
png_data = svg2png(bytestring=svg_data, output_width=32, output_height=32)

# Converte PNG para ICO
img = Image.open(io.BytesIO(png_data))
img.save('favicon.ico', format='ICO')