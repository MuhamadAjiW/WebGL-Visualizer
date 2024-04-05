# Tugas Besar Grafika Komputer

Using pure WebGL to implement a web application with drawing, editing, and visualizing a variety of models on a canvas.

## Implemented models, along with their special methods:

- **Line**: Adjust length
- **Square**: Adjust side length
- **Rectangle**: Adjust length or width
- **Polygon**: Addition and deletion of corner points

## For each model, the following can be done:

- 2 geometry transformations: translation, scaling, rotation
- Move one of the corner points using a slider or drag and drop
- Change the color of one or all corner points
- Save a created model

## Advanced features:

- Implementation of an algorithm to draw polygons in such a way that regardless of the changing order of adding points, the final polygon image remains the same, which is the convex hull of its points.
- Integration of animation on flat shapes
- Integration of animation on each vertex (marker)
- Calculation of the centroid of the polygon for rotational purposes

Kelompok SukaSamaKamu
- Fakhri Muhammad Mahendra / 13521045
- Razzan Daksana Yoni / 13521087
- Muhamad Aji Wibisono / 13521095

# Cara menggunakan program
1. Lakukan clone di repository ini
2. Masuk ke direktori, jalankan
    > npm run dev
3. Buka localhost:5173 pada browser