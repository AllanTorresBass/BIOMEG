# Mantenimiento

**Opened:** the menu only. No maintenance screen was opened. These commands change setup and safety, not the day’s patients.

| Command | Reading |
|---|---|
| Aplicar Aumento General | Apply a general price increase |
| Precio Examenes | Exam prices. Lista de Precios is the inquiry. This is the maintenance entry |
| Modificar Valores | Change values. Which values (results, prices, reference text) is not shown |
| Crear Perfiles | Create profiles. A profile is the usual name for a panel of exams. The screen was not opened, so that reading stays a reading |
| Agregar Nota de Bacteriología | Add a bacteriology note. Separate from Registro de Observaciones de Bacteriología |
| QR | Turns the report QR on or off, or configures it. The shell already shows QR: ACTIVO, and the BIOMEG preview carries a QR. This command was not opened |
| Precio Sábado | Saturday pricing. The shell shows Precio Sábado: INACTIVO |
| Registro de Correo | Mail registration. Not “respaldo”. Likely the account used by ENVIAR CORREO. The form was not opened |
| Nuevo Usuario | Create a user. The shell shows one active user, LCDA. GIULIANA |
| Respaldo de la BD | Database backup, by its name. The form was not opened. The engine is still not named |
| Auditoría | An audit function. The screen was not opened, so the events it stores are unknown |

## How this sits against the earlier notes

[Users and concurrent work](../modules/users-and-concurrent-work.md) can now point at Nuevo Usuario and at Clave on the toolbar. The permission matrix is still absent.

[QR authenticity](../modules/qr-authenticity.md) is no longer only a marketing sentence. The shell has a QR flag, Mantenimiento has a QR command, and the preview shows a code. The payload of the code is still unread.

[Data store](../architecture/data-store.md) gains one fact: the product exposes Respaldo de la BD. Backup frequency, path, and engine remain unshown.

Modificar Valores is dangerous if it edits released results. The session does not say which values. Do not document it as a result-edit screen.
