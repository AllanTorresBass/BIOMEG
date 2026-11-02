# Pacientes

**Opened:** the menu and the flyout under Ingreso de Pacientes. The forms behind Modificar and Trasladar were not opened. The invoice opened from this area is [facturacion.md](facturacion.md).

| Command | Flyout | What is known |
|---|---|---|
| Ingreso de Pacientes | Particular | Same split as the toolbar button Ingreso Particular |
| Ingreso de Pacientes | Empresa | Same split as the toolbar button Ingreso Empresa |
| Facturar Consulta | — | Likely opens Facturación de Consultas, whose blank form is documented. Not confirmed by clicking this item |
| Modificar Pacientes | — | Name only. A patient can be changed after admission. The screen is not shown |
| Trasladar Paciente | — | Name only. A patient can be moved. Destination (another company, another order, another site) is not shown |

## How this sits against the earlier notes

[Patient admission](../modules/patient-admission.md) treated intake as one inferred step. The session shows two entry paths, Particular and Empresa, plus a separate billing command, a modify command, and a transfer command.

Particular versus Empresa is the first split. Tipo de Costo on the invoice (Rutina, Seguro/Empresa, Emergencia, Hospitalizado) is a second split on the same visit. Both are documented in [facturacion.md](facturacion.md). How they interact is not shown.
