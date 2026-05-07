# 🎾 Academia LR — App de Gestión

App web para la gestión de alumnos, asistencia y pagos de la Academia Lucho Rolando.

---

## 🚀 Cómo publicar en GitHub Pages

### 1. Crear el repositorio en GitHub
- Andá a [github.com](https://github.com) → **New repository**
- Nombre: `academia-lr` (exactamente igual al `base` en `vite.config.js`)
- Visibilidad: **Public** (necesario para GitHub Pages gratis)
- No inicialices con README

### 2. Subir los archivos
```bash
git init
git add .
git commit -m "Initial commit — Academia LR"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/academia-lr.git
git push -u origin main
```

### 3. Activar GitHub Pages
- En tu repo → **Settings** → **Pages**
- Source: **GitHub Actions**
- El deploy se hace automático cada vez que hacés `git push`

### 4. Tu app estará en:
```
https://TU_USUARIO.github.io/academia-lr/
```

---

## 💻 Desarrollo local

```bash
npm install
npm run dev
```

---

## 🔐 PINs de acceso

| Usuario | PIN |
|---------|-----|
| Profe (admin) | `9999` |
| Alumnos | PIN individual asignado |

---

## 📁 Estructura del proyecto

```
academia-lr/
├── src/
│   ├── App.jsx        ← Toda la lógica y UI
│   └── main.jsx       ← Entry point de React
├── index.html
├── vite.config.js     ← Configuración de Vite
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml ← Deploy automático
```

---

## 🔜 Próximos pasos

- [ ] Conectar con Google Sheets via Apps Script API
- [ ] Sistema de desafíos entre alumnos
- [ ] Ranking y torneos
- [ ] Notificaciones por WhatsApp

---

**Academia Lucho Rolando · 2026**
