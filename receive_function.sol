// Código Solidity para agregar al contrato ZorritoYieldEscrow
// Esta función permite recibir CELO nativo y convertirlo automáticamente a CELO ERC20

/**
 * @dev Receive function to accept native CELO
 * Automatically converts CELO native to CELO ERC20 and deposits it
 * 
 * IMPORTANTE: Reemplaza `_depositInternal` con la lógica interna de tu contrato
 * Si tu contrato tiene una función `_deposit(uint256 amount, address user)`, úsala
 */
receive() external payable {
    require(msg.value > 0, "ZorritoYieldEscrow: No CELO sent");
    
    // El contrato CELO ERC20 en Celo Mainnet es: 0x471EcE3750Da237f93B8E339C536989b8978a438
    // Este contrato tiene una función deposit() que convierte CELO nativo a CELO ERC20 1:1
    
    // Opción 1: Si el contrato CELO ERC20 tiene deposit() payable
    // (Esta es la forma más simple)
    IWrappedCELO wrappedCELO = IWrappedCELO(celoToken);
    wrappedCELO.deposit{value: msg.value}();
    
    // El amount de CELO ERC20 recibido es igual a msg.value (conversión 1:1)
    uint256 celoTokenAmount = msg.value;
    
    // Ahora necesitas llamar a tu lógica de depósito interna
    // Ajusta esto según la estructura de tu contrato:
    
    // Si tienes una función interna _deposit:
    _deposit(celoTokenAmount, msg.sender);
    
    // O si necesitas aprobar primero y luego llamar a deposit:
    // IERC20(celoToken).approve(address(this), celoTokenAmount);
    // deposit(celoTokenAmount);
}

/**
 * @dev Fallback function para rechazar llamadas con datos
 */
fallback() external payable {
    revert("ZorritoYieldEscrow: Use receive() to deposit native CELO");
}

/**
 * @dev Interfaz para el contrato Wrapped CELO
 * El contrato CELO ERC20 en Celo tiene esta función para convertir nativo a ERC20
 */
interface IWrappedCELO {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
}

// ============================================
// ALTERNATIVA: Si el contrato CELO no tiene deposit() payable
// ============================================

/*
receive() external payable {
    require(msg.value > 0, "ZorritoYieldEscrow: No CELO sent");
    
    // Convertir CELO nativo a CELO ERC20 usando low-level call
    // El contrato CELO ERC20 tiene una función deposit() que acepta CELO nativo
    address celoTokenContract = celoToken; // 0x471EcE3750Da237f93B8E339C536989b8978a438
    
    (bool success, bytes memory data) = celoTokenContract.call{value: msg.value}(
        abi.encodeWithSignature("deposit()")
    );
    
    require(success, "ZorritoYieldEscrow: Failed to wrap CELO");
    
    // El amount de CELO ERC20 es igual a msg.value (1:1)
    uint256 celoTokenAmount = msg.value;
    
    // Llamar a la lógica de depósito
    _deposit(celoTokenAmount, msg.sender);
}
*/

