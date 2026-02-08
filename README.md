# MySandbox 🪨💧🌱

A high-performance, interactive falling sand simulation built with **p5.js** and **GSAP**. Experience the emergent complexity of simple particle interactions, from fluid dynamics to biological growth.

![Sand Simulation Preview](sand.png)

## ✨ Features

- **Fluid & Particle Physics**: Realistic gravity, stacking, and liquid flow.
- **Dynamic Materials**:
  - **Sand**: Classic granular behavior, stacks and slides.
  - **Water**: Flows horizontally, fills gaps, and interacts with other elements.
  - **Mud**: Formed when water touches sand. Sturdier than sand but behaves as a semi-solid.
  - **Seed/Plant**: A sophisticated biological system. Seeds sprout on mud, growing into tree-like structures with branching canopies and energy-based aging.
- **Smooth Interaction**: Interactive brush with GSAP-powered UI animations for material selection.
- **Responsive Design**: Automatically adjusts to window resizing without losing resolution.

## 🚀 Getting Started

Since this is a client-side web application, you can run it without any build step.

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/JS_Sandbox.git
   ```
2. Open `index.html` in your favorite web browser.
3. *Alternatively*, use a local server for the best experience:
   ```bash
   npx serve .
   ```

## 🛠️ Built With

- **[p5.js](https://p5js.org/)** - Core drawing and simulation logic.
- **[GSAP](https://greensock.com/gsap/)** - High-performance UI animations and transitions.
- **Vanilla JS & CSS** - Lightweight and efficient.

## 🕹️ Controls

- **Mouse Drag**: Paint materials onto the canvas.
- **Buttons**: Select between Sand, Water, Mud, and Seed brushes.
- **Resize Window**: The simulation adapts instantly to your screen.

---

*Enjoy experimenting in the sandbox!*
