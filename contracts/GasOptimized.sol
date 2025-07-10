// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title GasOptimized
 * @notice Gas optimization patterns and DoS protection utilities
 * @dev Provides reusable gas optimization and security patterns
 */
library GasOptimized {
    /**
     * @notice Maximum allowed gas for loops to prevent DoS
     * @dev Prevents unbounded loops that could exceed block gas limit
     */
    uint256 private constant MAX_LOOP_GAS = 5_000_000;

    /**
     * @notice Maximum iterations per batch operation
     */
    uint256 private constant MAX_BATCH_SIZE = 100;

    /**
     * @notice Gas limit per individual operation
     */
    uint256 private constant GAS_PER_OPERATION = 50_000;

    /**
     * @dev Error thrown when operation would exceed gas limits
     */
    error GasLimitExceeded(uint256 required, uint256 available);

    /**
     * @dev Error thrown when batch size exceeds maximum
     */
    error BatchSizeTooLarge(uint256 size, uint256 maxSize);

    /**
     * @notice Check if array operation is safe from DoS
     * @param arrayLength Length of array to process
     * @return bool True if operation is safe
     */
    function isSafeArrayOperation(uint256 arrayLength) internal pure returns (bool) {
        return arrayLength * GAS_PER_OPERATION <= MAX_LOOP_GAS;
    }

    /**
     * @notice Validate batch size for operations
     * @param batchSize Number of items in batch
     */
    function validateBatchSize(uint256 batchSize) internal pure {
        if (batchSize > MAX_BATCH_SIZE) {
            revert BatchSizeTooLarge(batchSize, MAX_BATCH_SIZE);
        }
    }

    /**
     * @notice Estimate gas for array operation
     * @param arrayLength Length of array
     * @return uint256 Estimated gas cost
     */
    function estimateArrayGas(uint256 arrayLength) internal pure returns (uint256) {
        return arrayLength * GAS_PER_OPERATION;
    }

    /**
     * @notice Check if operation would exceed available gas
     * @param requiredGas Gas required for operation
     */
    function checkGasLimit(uint256 requiredGas) internal view {
        uint256 availableGas = gasleft();
        if (requiredGas > availableGas) {
            revert GasLimitExceeded(requiredGas, availableGas);
        }
    }

    /**
     * @notice Calculate safe batch count for large operations
     * @param totalItems Total number of items to process
     * @return uint256 Number of batches needed
     */
    function calculateBatchCount(uint256 totalItems) internal pure returns (uint256) {
        return (totalItems + MAX_BATCH_SIZE - 1) / MAX_BATCH_SIZE;
    }
}

/**
 * @title DoSProtection
 * @notice Protection patterns against Denial of Service attacks
 * @dev Implements rate limiting and gas monitoring
 */
abstract contract DoSProtection {
    /**
     * @notice Mapping of address to last action timestamp
     */
    mapping(address => uint256) private _lastActionTime;

    /**
     * @notice Mapping of address to action count in current period
     */
    mapping(address => uint256) private _actionCount;

    /**
     * @notice Rate limit period (default: 1 hour)
     */
    uint256 private constant RATE_LIMIT_PERIOD = 1 hours;

    /**
     * @notice Maximum actions per period
     */
    uint256 private constant MAX_ACTIONS_PER_PERIOD = 100;

    /**
     * @dev Error thrown when rate limit is exceeded
     */
    error RateLimitExceeded(address user, uint256 actionsUsed, uint256 maxActions);

    /**
     * @dev Error thrown when cooldown period not elapsed
     */
    error CooldownNotElapsed(address user, uint256 remainingTime);

    /**
     * @notice Modifier to enforce rate limiting
     */
    modifier rateLimit() {
        address user = msg.sender;
        uint256 currentTime = block.timestamp;

        // Reset counter if period has elapsed
        if (currentTime >= _lastActionTime[user] + RATE_LIMIT_PERIOD) {
            _actionCount[user] = 0;
            _lastActionTime[user] = currentTime;
        }

        // Check rate limit
        if (_actionCount[user] >= MAX_ACTIONS_PER_PERIOD) {
            revert RateLimitExceeded(user, _actionCount[user], MAX_ACTIONS_PER_PERIOD);
        }

        _actionCount[user]++;
        _;
    }

    /**
     * @notice Get remaining actions for user in current period
     * @param user Address to check
     * @return uint256 Number of actions remaining
     */
    function getRemainingActions(address user) public view returns (uint256) {
        if (block.timestamp >= _lastActionTime[user] + RATE_LIMIT_PERIOD) {
            return MAX_ACTIONS_PER_PERIOD;
        }
        return MAX_ACTIONS_PER_PERIOD - _actionCount[user];
    }

    /**
     * @notice Get time until rate limit resets
     * @param user Address to check
     * @return uint256 Seconds until reset
     */
    function getResetTime(address user) public view returns (uint256) {
        uint256 resetTime = _lastActionTime[user] + RATE_LIMIT_PERIOD;
        if (block.timestamp >= resetTime) {
            return 0;
        }
        return resetTime - block.timestamp;
    }
}

/**
 * @title StorageOptimizer
 * @notice Storage optimization patterns
 * @dev Demonstrates efficient storage packing
 */
contract StorageOptimizer {
    /**
     * @notice Packed struct example (fits in 1 storage slot)
     * @dev uint128 + uint64 + uint32 + uint16 + uint8 + bool = 256 bits
     */
    struct PackedData {
        uint128 value1; // 16 bytes
        uint64 value2; // 8 bytes
        uint32 value3; // 4 bytes
        uint16 value4; // 2 bytes
        uint8 value5; // 1 byte
        bool isActive; // 1 byte (padded)
    }

    /**
     * @notice Example of storage slot packing
     */
    struct OptimizedStorage {
        uint128 id;
        uint64 timestamp;
        uint32 count;
        uint16 flags;
        uint8 status;
        bool initialized;
    }

    /**
     * @notice Demonstrate constant vs immutable vs storage
     */
    uint256 private constant CONSTANT_VALUE = 100; // No storage cost
    uint256 private immutable IMMUTABLE_VALUE; // Set once at deploy
    uint256 private storageValue; // Storage slot (expensive)

    constructor(uint256 _immutableValue) {
        IMMUTABLE_VALUE = _immutableValue;
    }

    /**
     * @notice Gas-efficient array operations
     * @dev Use memory for temporary operations
     */
    function efficientArrayOperation(uint256[] calldata data) external pure returns (uint256 sum) {
        // Use calldata for read-only external function parameters
        uint256 length = data.length; // Cache length
        for (uint256 i = 0; i < length; ) {
            sum += data[i];
            unchecked {
                ++i; // Unchecked increment saves gas
            }
        }
    }

    /**
     * @notice Demonstrate bitmap for flags
     * @dev Single uint256 can store 256 boolean flags
     */
    uint256 private flagsBitmap;

    function setFlag(uint8 flagIndex, bool value) external {
        require(flagIndex < 256, "Invalid flag index");
        if (value) {
            flagsBitmap |= (1 << flagIndex); // Set bit
        } else {
            flagsBitmap &= ~(1 << flagIndex); // Clear bit
        }
    }

    function getFlag(uint8 flagIndex) external view returns (bool) {
        require(flagIndex < 256, "Invalid flag index");
        return (flagsBitmap & (1 << flagIndex)) != 0;
    }
}
