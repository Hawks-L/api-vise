# README — API VISE

Esta documentación explica **qué hace** cada carpeta/archivo del proyecto, **cómo fluye** una petición, y **cómo probar** la API. El objetivo es mapear 1:1 los requisitos de *Actividad VISE* (restricciones y beneficios por tipo de tarjeta) con la implementación.

> Stack: **Node.js + Express + TypeScript + Zod + Jest**. Persistencia **in-memory** (para la actividad). Endpoints: `POST /client`, `POST /purchase`, `GET /health`.

---

## 1) Estructura de carpetas

```
src/
├─ controllers/
│  ├─ client.controller.ts        # Orquesta la lógica de /client
│  └─ purchase.controller.ts      # Orquesta la lógica de /purchase
├─ routes/
│  ├─ client.routes.ts            # Define rutas /client
│  └─ purchase.routes.ts          # Define rutas /purchase
├─ services/
│  ├─ client.service.ts           # Lógica de negocio de clientes (registro, búsqueda)
│  └─ purchase.service.ts         # Lógica de compras (beneficios + restricciones)
├─ models/
│  ├─ card.ts                     # Tipos de tarjeta
│  ├─ client.ts                   # Interface del Cliente
│  └─ purchase.ts                 # Tipos de compra y respuesta
├─ utils/
│  ├─ benefits.ts                 # Cálculo de descuentos/beneficios por tarjeta
│  └─ restrictions.ts             # Reglas de elegibilidad y bloqueo por país
├─ middleware/
│  └─ validate.ts                 # Middleware de validación de entrada (Zod)
├─ schemas/
│  ├─ client.schema.ts            # Zod schema para POST /client
│  └─ purchase.schema.ts          # Zod schema para POST /purchase
├─ app.ts                         # Instancia de Express, mounting de rutas
└─ index.ts                       # Punto de entrada: lee .env y levanta el servidor

tests/
└─ benefits.spec.ts               # Pruebas unitarias de beneficios (ejemplos base)
```

---

## 2) Flujo de una petición

### 2.1 POST /client

```
Request (JSON) → routes/client.routes → validateBody(client.schema)
  → controllers/client.controller → services/client.service
    → utils/restrictions.isEligibleForCard → (ok?)
      → respuesta 200 { status: "Registered", ... }
      ↳ si falla elegibilidad → respuesta 200 { status: "Rejected", error }
```

* **`validateBody`**: usa Zod para validar shape y tipos del body. Si el JSON no cumple (parámetros faltantes/tipos mal), responde **400** con `{ status: "Rejected", error }`.
* **`isEligibleForCard`**: valida restricciones de **ingresos mínimos**, **suscripción VISE CLUB** y **residencia prohibida** para Black/White. Si es válido, el service crea un `clientId` y lo guarda en memoria.

### 2.2 POST /purchase

```
Request (JSON) → routes/purchase.routes → validateBody(purchase.schema)
  → controllers/purchase.controller → services/purchase.service
    → findClient (existe?)
    → utils/restrictions.canPurchaseInCountry (bloquea Black/White en países prohibidos)
    → utils/benefits.computeBenefits (aplica descuentos)
      → respuesta 200 { status: "Approved", purchase: {...} }
      ↳ si no existe cliente o país bloqueado → 200 { status: "Rejected", error }
```

* **findClient**: toma `clientId` y obtiene el cliente registrado (de la memoria del proceso).
* **canPurchaseInCountry**: si tarjeta es **Black/White** y `purchaseCountry` ∈ {China, Vietnam, India, Irán}, **rechaza**.
* **computeBenefits**: calcula descuentos según **día de la semana** (UTC), **monto**, **origen exterior**.

### 2.3 GET /health

* Responde `{ ok: true }` para monitoreo rápido.

> **Nota de diseño**: Los errores de **validación de esquema** responden **400**. Las reglas de **negocio** (elegibilidad/beneficios/bloqueos) responden **200** con `status: "Rejected"` o `status: "Approved"`, siguiendo el ejemplo del enunciado.

---

## 3) Carpeta a carpeta (con detalle)

### 3.1 `models/`

* **`card.ts`**: `export type CardType = 'Classic'|'Gold'|'Platinum'|'Black'|'White'`.
* **`client.ts`**: Interface `Client` con `clientId`, `name`, `country`, `monthlyIncome`, `viseClub`, `cardType`.
* **`purchase.ts`**: Tipos para **entrada** de compra (`PurchaseInput`) y **salida** (`PurchaseResult`). Estructura de la respuesta aprobada incluye: `originalAmount`, `discountApplied`, `finalAmount`, `benefit`.

### 3.2 `schemas/`

* **`client.schema.ts`**: Requeridos: `name`, `country`, `monthlyIncome >= 0`, `viseClub (boolean)`, `cardType` ∈ enum. Evita payloads incompletos.
* **`purchase.schema.ts`**: Requeridos: `clientId (int > 0)`, `amount (> 0)`, `currency`, `purchaseDate (ISO string)`, `purchaseCountry`.

### 3.3 `middleware/validate.ts`

Middleware genérico `validateBody(schema)`:

* Hace `schema.safeParse(req.body)`.
* Si falla: responde **400** con `{ status: 'Rejected', error: <mensajes de Zod> }`.
* Si pasa: continúa a controller.

### 3.4 `utils/restrictions.ts`

* **Constante** `PROHIBITED_COUNTRIES = ['China','Vietnam','India','Irán']`.
* **`isEligibleForCard(payload)`**:

  * **Classic**: sin restricciones.
  * **Gold**: ingreso mínimo **≥ 500 USD**.
  * **Platinum**: ingreso **≥ 1000 USD** **y** `viseClub=true`.
  * **Black/White**: ingreso **≥ 2000 USD**, `viseClub=true`, **no** residir en países prohibidos.
  * Devuelve `{ ok:true }` o `{ ok:false, reason }`.
* **`canPurchaseInCountry(cardType, purchaseCountry)`**:

  * Si tarjeta es **Black/White** y el **país de compra** está prohibido → `false` (se rechaza la compra en el service).

### 3.5 `utils/benefits.ts`

Reglas de **beneficios** (descuentos) por tarjeta. Se calcula con `getUTCDay()` (0=Dom, 1=Lun, 6=Sáb). Se aplica **un solo beneficio** por compra (el primero que coincida por el orden de if/else). Resumen:

| Tarjeta  | Días / Condición                          | Descuento |
| -------- | ----------------------------------------- | --------- |
| Classic  | No Aplica                                 | 0%        |
| Gold     | **Lun-Mar-Mié** y **monto > 100**         | 15%       |
| Platinum | **Lun-Mar-Mié** y **monto > 100** → 20%   | 20%       |
|          | **Sábado** y **monto > 200**              | 30%       |
|          | **Exterior** (país compra ≠ país cliente) | 5%        |
| Black    | **Lun-Mar-Mié** y **monto > 100**         | 25%       |
|          | **Sábado** y **monto > 200**              | 35%       |
|          | **Exterior** (país compra ≠ país cliente) | 5%        |
| White    | **Lun-Vie** y **monto > 100**             | 25%       |
|          | **Sáb-Dom** y **monto > 200**             | 35%       |
|          | **Exterior** (país compra ≠ país cliente) | 5%        |

**Orden de precedencia (por código)**:

* `Gold`/`Platinum`/`Black`: primero **Lun-Mar-Mié**, luego **Sábado**, luego **Exterior**.
* `White`: primero **Lun-Vie**, luego **Sáb-Dom**, luego **Exterior**.

> Implicación: si una compra coincide con dos reglas, se aplica **la primera** del orden anterior.

### 3.6 `services/`

* **`client.service.ts`**

  * Guarda clientes en **memoria** con un contador incremental `seq` para `clientId`.
  * `registerClient(payload)`: valida con `isEligibleForCard`. Si ok → crea y devuelve cliente; si no → razón del rechazo.
  * `findClient(id)`: retorna cliente por id. (**Importante**: se reinicia al reiniciar el proceso.)
* **`purchase.service.ts`**

  * `processPurchase(input)`

    * Busca cliente con `findClient`.
    * Verifica país con `canPurchaseInCountry` (bloqueo Black/White en países prohibidos).
    * Calcula beneficios con `computeBenefits`.
    * Redondeo a 2 decimales (`toFixed(2)` → `Number`).

### 3.7 `controllers/`

* **`client.controller.ts`**: maneja la respuesta de `/client`. Si el service rechaza, responde `{ status:'Rejected', error }`. Si registra, responde `{ status:'Registered', message }` + datos mínimos.
* **`purchase.controller.ts`**: maneja la respuesta de `/purchase`. Si el service rechaza, responde `{ status:'Rejected', error }`. Si aprueba, `{ status:'Approved', purchase:{...} }`.

### 3.8 `routes/`

* **`client.routes.ts`**: `POST /client` con middleware `validateBody(createClientSchema)`.
* **`purchase.routes.ts`**: `POST /purchase` con `validateBody(purchaseSchema)`.

### 3.9 `app.ts` y `index.ts`

* **`app.ts`**: crea la app Express, monta rutas y `GET /health`.
* **`index.ts`**: carga `.env`, lee `PORT` y lanza `app.listen`.

---

## 4) Cómo funcionan las peticiones

### 4.1 Registrar cliente — `POST /client`

**Body (ejemplo válido Platinum):**

```json
{
  "name": "John Doe",
  "country": "USA",
  "monthlyIncome": 1200,
  "viseClub": true,
  "cardType": "Platinum"
}
```

**Respuesta (válida):**

```json
{
  "clientId": 1,
  "name": "John Doe",
  "cardType": "Platinum",
  "status": "Registered",
  "message": "Cliente apto para tarjeta Platinum"
}
```

**Respuesta (rechazada por regla):**

```json
{
  "status": "Rejected",
  "error": "Suscripción VISE CLUB requerida para Platinum"
}
```

**Respuesta (400 por esquema inválido):**

```json
{
  "status": "Rejected",
  "error": "Required"
}
```

### 4.2 Procesar compra — `POST /purchase`

**Body:**

```json
{
  "clientId": 1,
  "amount": 250,
  "currency": "USD",
  "purchaseDate": "2025-09-20T14:30:00Z",
  "purchaseCountry": "France"
}
```

**Respuesta (aprobada con beneficio):**

```json
{
  "status": "Approved",
  "purchase": {
    "clientId": 1,
    "originalAmount": 250,
    "discountApplied": 75,
    "finalAmount": 175,
    "benefit": "Sábado - Descuento 30%"
  }
}
```

**Respuesta (rechazo por país para Black/White):**

```json
{
  "status": "Rejected",
  "error": "El cliente con tarjeta Black no puede realizar compras desde China"
}
```

> **Días y horarios**: el servidor interpreta `purchaseDate` como **UTC** (`...Z`). `getUTCDay()` define el día de la semana. Si envías hora local sin `Z`, podrías clasificar mal el día.

---

## 5) Cómo probar rápidamente

* **Servidor**: `npm run dev` (o `npm run build && npm start`).
* **Postman**: usar la ruta http://localhost:3000/(PeticionARealizar) y luego  **Purchases**.
* **cURL**: ver ejemplos en la guía del proyecto.
* **Jest**: `npm test` (pruebas unitarias de beneficios). Puedes añadir más pruebas a `tests/` contra `computeBenefits`, `isEligibleForCard` y `processPurchase`.

---

## 6) Decisiones y convenciones

* **HTTP 200 con `status:"Rejected"`** para rechazos de negocio (por compatibilidad con el enunciado). **HTTP 400** solo para errores de validación de JSON.
* **Precedencia de beneficios**: "día de semana" > "sábado / fin de semana" > "exterior" (según tarjeta). Solo se aplica **un** beneficio por compra.
* **Redondeo**: `discountApplied` y `finalAmount` se devuelven con **2 decimales**.
* **Persistencia**: in-memory (se reinicia al reiniciar el proceso). Ideal para la actividad; reemplazable por DB.

---

## 7) FAQ

**Q:** ¿Por qué a veces `clientId=1` compra en China y no se rechaza?
**A:** Porque fue registrado como **Platinum**; el bloqueo de compras en países prohibidos aplica solo a **Black/White**. Usa un `clientId` Black/White para ver el rechazo.

**Q:** ¿Qué pasa si una compra cumple varias reglas?
**A:** Se aplica **la primera** por el orden indicado en `utils/benefits.ts`.

**Q:** ¿Cómo agrego una nueva tarjeta?
**A:** Añade el tipo en `models/card.ts`, define sus **restricciones** en `utils/restrictions.ts` y sus **beneficios** en `utils/benefits.ts`. Si es necesario, actualiza `schemas`.
