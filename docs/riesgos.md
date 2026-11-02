# Matriz de riesgos

Revisar en cada retrospectiva. Probabilidad e impacto: baja/media/alta.

| Riesgo | Probabilidad | Impacto | Respuesta (acción concreta) | Responsable |
| ------ | ------------ | ------- | --------------------------- | ----------- |
|   Falla en la API / Servicios externos (ej. caída de servicios de terceros o endpoints que devuelven errores inesperados).     |   Media           |     Alta    |     Implementar manejo de errores y mensajes de fallback en el frontend para que la app no colapse.                        |      Desarrolladores / Todos       |
|   Falla crítica en el sistema de Login o Autenticación (ej. errores al hashear o usuarios bloqueados sin poder entrar).     |   Media           |     Critico (Alta)    |     Realizar pruebas unitarias específicas de autenticación antes de fusionar código a la rama principal.                        |        Desarrolladores     |
| Demoras o problemas de tiempo para completar las tareas del sprint a tiempo (sobrecarga de trabajo o tareas más complejas de lo esperado). | Alta | Media | Reducir la tarea o renegociar prioridades con el referente de producto en el siguiente sprint. | Fabricio (Referente del producto) |
| Ausencia o enfermedad de un compañero del equipo en un momento clave del sprint. | Media | Media | Mantener buena comunicacion y ademas, el repositorio bien documentado para que otro pueda retomar el código fácilmente. | Facilitacion / Todos |
| Imprevisto fuera del proyecto (ej. cortes de luz o problemas personales que resten horas de desarrollo). | Media | Media | Avisar con anticipación en el canal de comunicación del equipo para redistribuir las subtareas críticas entre los demás integrantes. | Todos |
