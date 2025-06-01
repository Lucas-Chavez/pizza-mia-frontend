# Pizza Mia - Frontend (Dashboard Administrador)

##  🏢 Descripción General

Este proyecto es el frontend del dashboard para el administrador de Pizza Mia, desarrollado con **React**, **TypeScript** y **Vite** como bundler y servidor de desarrollo.

Está diseñado para ser modular y escalable, con una arquitectura basada en funcionalidades (feature-based) que agrupa componentes, estilos y lógica por módulos funcionales.

##  📁 Estructura de Carpetas
```
pizza-mia-frontend/
├── public/
├── src/
│   ├── assets/                 # Íconos, imágenes y recursos estáticos
│   │   └── icons/
│   ├── components/             # Componentes reutilizables generales (botones, navbar, sidebar, tablas genéricas)
│   ├── features/               # Módulos funcionales del dashboard (administración, insumos, productos, etc.)
│   ├── layout/                 # Layouts generales (e.g. dashboard)
│   ├── api/                    # Lógica de comunicación con el backend
│   ├── types/                  # Definiciones TypeScript (interfaces y tipos)
│   ├── styles/                 # Estilos globales, variables y temas
│   ├── routes/                 # Rutas de la aplicación
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts

```
 
##  🔄 Rutas Principales

-  `/admin/*` ➜ Portal de administradores (gestión de productos, pedidos, etc.)

##  📦 Dependencias Instaladas

Estas son las principales dependencias utilizadas en el proyecto:
```
npm  install  react-router-dom
npm  install  chart.js  react-chartjs-2
npm  install  xlsx
npm  install  file-saver
npm  install  --save-dev  @types/file-saver
npm  install  exceljs
npm  install  html2canvas
```
### Descripción de dependencias
-   **react-router-dom**: manejo de rutas SPA
-   **chart.js y react-chartjs-2**: gráficos
-   **xlsx, file-saver, exceljs, html2canvas**: exportación y captura de datos

##  🌐 Repositorio del Proyecto
Repositorio oficial de este frontend: https://github.com/Lucas-Chavez/pizza-mia-frontend.git

##  📥 Clonación del proyecto

Para clonar el repositorio en tu máquina local:
```
git  clone  https://github.com/Lucas-Chavez/pizza-mia-frontend.git
cd  pizza-mia-frontend
npm  install
npm  run  dev
```
Nombre del archivo raíz del proyecto: `pizza-mia-frontend`