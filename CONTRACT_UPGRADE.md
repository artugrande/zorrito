# Upgrade del Contrato ZorritoYieldEscrow para Aceptar CELO Nativo

## Problema Actual
El contrato `ZorritoYieldEscrow` tiene la función `deposit(uint256 amount)` que es `nonpayable` y espera CELO ERC20 token, no CELO nativo.

## Solución Recomendada: Agregar `receive()`

Esta es la mejor solución porque:
- ✅ No rompe compatibilidad con código existente
- ✅ Es el estándar de Solidity para recibir tokens nativos
- ✅ Se ejecuta automáticamente cuando se envía CELO nativo
- ✅ Reutiliza toda la lógica existente

## Código a Agregar al Contrato

Agrega esta función al contrato `ZorritoYieldEscrow.sol`:

```solidity
/**
 * @dev Receive function to accept native CELO
 * Automatically converts CELO native to CELO ERC20 and deposits it
 */
receive() external payable {
    require(msg.value > 0, "No CELO sent");
    
    // Convert native CELO to CELO ERC20 using the wrapped CELO contract
    // CELO_TOKEN_ADDRESS is the wrapped CELO contract (0x471EcE3750Da237f93B8E339C536989b8978a438)
    IERC20 celoToken = IERC20(celoToken);
    
    // Wrap native CELO to CELO ERC20
    // The wrapped CELO contract has a deposit() function that converts native to ERC20
    (bool success, ) = address(celoToken).call{value: msg.value}(
        abi.encodeWithSignature("deposit()")
    );
    require(success, "Failed to wrap CELO");
    
    // Get the amount of wrapped CELO received (should be 1:1)
    uint256 wrappedAmount = celoToken.balanceOf(address(this)) - 
        (totalPrincipal - principal[msg.sender]);
    
    // Approve the wrapped CELO for internal deposit
    celoToken.approve(address(this), wrappedAmount);
    
    // Call the existing deposit logic
    _deposit(wrappedAmount, msg.sender);
}

/**
 * @dev Fallback function (optional, for safety)
 */
fallback() external payable {
    revert("Use receive() to deposit CELO");
}
```

## Alternativa Más Simple (Si el contrato CELO ERC20 tiene deposit())

Si el contrato CELO ERC20 tiene una función `deposit()` que acepta CELO nativo:

```solidity
/**
 * @dev Receive function to accept native CELO
 * Converts to CELO ERC20 and deposits automatically
 */
receive() external payable {
    require(msg.value > 0, "No CELO sent");
    
    // Convert native CELO to CELO ERC20
    // The CELO ERC20 contract wraps native CELO 1:1
    IWrappedCELO wrappedCELO = IWrappedCELO(celoToken);
    wrappedCELO.deposit{value: msg.value}();
    
    // Get the wrapped amount (should equal msg.value)
    uint256 wrappedAmount = msg.value;
    
    // Transfer the wrapped CELO to this contract's balance
    // Then call internal deposit logic
    IERC20(celoToken).transferFrom(address(this), address(this), wrappedAmount);
    
    // Call existing deposit function internally
    _depositInternal(wrappedAmount, msg.sender);
}
```

## Interfaz Necesaria

Si no existe, agrega esta interfaz al contrato:

```solidity
interface IWrappedCELO {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
}
```

## Pasos para Implementar

1. **Abre el contrato** `ZorritoYieldEscrow.sol` en Remix o tu editor
2. **Agrega la función `receive()`** usando una de las opciones de arriba
3. **Asegúrate de tener acceso a**:
   - La variable `celoToken` (address del CELO ERC20)
   - La función interna `_deposit()` o la lógica de depósito
4. **Compila el contrato**
5. **Despliega la nueva versión** o usa un proxy upgrade si tienes
6. **Verifica el contrato** en CeloScan

## Verificación

Después de desplegar, verifica que:
- ✅ Puedes enviar CELO nativo directamente al contrato
- ✅ El CELO se convierte a CELO ERC20 automáticamente
- ✅ El depósito se registra correctamente
- ✅ La función `deposit()` original sigue funcionando

## Nota Importante

El contrato CELO ERC20 en Celo Mainnet (`0x471EcE3750Da237f93B8E339C536989b8978a438`) es un contrato wrapped que permite convertir CELO nativo a CELO ERC20 usando `deposit()`.

