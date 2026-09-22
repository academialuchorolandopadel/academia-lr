// src/hooks/useBackClose.js
// Hace que el botón "atrás" del celular cierre lo que esté abierto
// (una ficha, un modal, una pestaña) en vez de salir de la app.
//
// Uso:  useBackClose(estaAbierto, () => cerrarlo())
// Cada cosa abierta es una "capa". Atrás cierra siempre la de más arriba.
// Si no queda ninguna capa abierta, atrás sale de la app (como siempre).
import { useEffect, useRef } from "react"

const pila = []        // funciones de cierre; la última es la capa de más arriba
let ignorarPop = 0     // retrocesos que hizo la app sola (no el usuario)
let pendientes = 0     // retrocesos silenciosos acumulados en el mismo instante

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    if (ignorarPop > 0) { ignorarPop--; return }
    const cerrar = pila.pop()
    if (cerrar) cerrar()
  })
}

// Cuando algo se cierra con un botón (no con atrás), hay que borrar la
// entrada que habíamos agregado al historial, sin que eso cierre otra capa.
function retrocederSilencioso() {
  pendientes++
  if (pendientes > 1) return
  setTimeout(() => {
    const n = pendientes
    pendientes = 0
    ignorarPop++
    window.history.go(-n)
  }, 0)
}

export function useBackClose(abierto, onCerrar) {
  const cbRef = useRef(onCerrar)
  cbRef.current = onCerrar

  useEffect(() => {
    if (!abierto) return
    const capa = () => { capa.cerrada = true; cbRef.current() }
    pila.push(capa)
    window.history.pushState({ lr: true }, "")
    return () => {
      const i = pila.indexOf(capa)
      if (i !== -1) pila.splice(i, 1)
      if (!capa.cerrada) retrocederSilencioso()
    }
  }, [abierto])
}
