
export const getLanguageLevel = (day: number): string => {
    if (day <= 0) return 'A1';
    if (day < 69) return 'A1';
    if (day < 145) return 'A2';
    if (day < 187) return 'B1';
    if (day < 205) return 'B2';
    if (day < 233) return 'C1';
    return 'C1';
};

export const isContentDay = (day: number): boolean => {
    // Explicit inclusions from the Kotlin code
    // this == 110 || this == 103 || ...
    const explicitInclusions = [
        110, 103, 117, 124, 131, 138,
        152, 159, 166, 173, 180,
        194, 201, 212, 219, 226,
        96, 89, 82, 75
    ];

    if (explicitInclusions.includes(day)) {
        return true;
    }

    // Logic: this % 7 == 0 && (this != 70) && ...
    if (day % 7 === 0) {
        const explicitExclusions = [
            70, 119, 217, 224, 231, 203,
            126, 210, 161, 154, 168, 133, 182,
            140, 175, 189, 196, 147,
            77, 84, 91, 98, 105, 112
        ];

        if (explicitExclusions.includes(day)) {
            return false;
        }
        return true;
    }

    return false;
};
