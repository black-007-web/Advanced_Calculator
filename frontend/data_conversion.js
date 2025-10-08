/**
 * data_conversion.js
 * Full conversion logic for data_conversion.html (Yuva — Data Conversion)
 *
 * Behavior:
 *  - Click a unit button once → selects it as SOURCE (highlighted).
 *  - Type numeric value in that section's input and press Enter → value is stored.
 *  - Click another unit button → selected as TARGET and conversion runs.
 *  - Output format: "<inputValue> <SRC> = <convertedValue> <TGT>"
 *  - Swap button: swaps SOURCE and TARGET and recomputes if possible.
 *  - Clear button: clears input, selections and output for that section.
 *
 * Formatting rules:
 *  - Show exact decimal result (trim trailing zeros) until values become extremely
 *    small (< 1e-7) or extremely large (> 1e9) — then switch to scientific (e)
 *    notation. This follows "show exact until zeros then e" requirement.
 *
 * Notes:
 *  - Currency section removed per user instruction.
 *  - Several special conversions (temperature, wavelength/frequency, Wh↔Ah) handled specially.
 *  - All code is vanilla JS and runs client-side.
 */

(function () {
  'use strict';

  // ---------------------------
  // Helper / Formatter
  // ---------------------------
  const fmtValue = (v) => {
    if (!isFinite(v)) return String(v);
    const abs = Math.abs(v);
    // thresholds: show normal decimal unless extremely small or large
    if ((abs !== 0 && abs < 1e-7) || abs > 1e9) {
      // scientific with up to 6 significant digits
      return Number(v).toExponential(6).replace(/(?:\.0+|(\.\d+?)0+)e/, '$1e');
    } else {
      // show up to 12 decimals but trim trailing zeros
      const s = Number(v).toFixed(12).replace(/\.?0+$/, '');
      return s === '-0' ? '0' : s;
    }
  };

  const safeParse = (s) => {
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  };

  // ---------------------------
  // Physical constants & maps
  // ---------------------------
  const C = {
    // speed of light m/s
    c: 299792458,
    // Avogadro
    N_A: 6.02214076e23
  };

  // Base factor maps: convert unit -> base (unit-specific base)
  // Many categories use a base unit for easy conversion: convert value_in_base = value * factor[unit]
  const FACTORS = {
    // LENGTH: base meter (m)
    length: {
      km: 1000,
      m: 1,
      cm: 0.01,
      mm: 0.001,
      'μm': 1e-6,
      nm: 1e-9,
      Å: 1e-10,
      in: 0.0254,
      ft: 0.3048,
      yd: 0.9144,
      mi: 1609.344,
      nmi: 1852,
      ly: 9.4607e15,
      AU: 1.495978707e11
    },

    // MASS: base kilogram (kg)
    mass: {
      tonne: 1000,
      kg: 1,
      g: 0.001,
      mg: 1e-6,
      'μg': 1e-9,
      lb: 0.45359237,
      oz: 0.028349523125,
      ton_us: 907.18474,
      ton_uk: 1016.0469088,
      carat: 0.0002,
      stone: 6.35029318
    },

    // AREA: base m^2
    area: {
      m2: 1,
      cm2: 0.0001,
      mm2: 1e-6,
      km2: 1e6,
      ha: 10000,
      acre: 4046.8564224
    },

    // VOLUME: base liter (L)
    volume: {
      m3: 1000,      // m^3 -> L
      L: 1,
      mL: 0.001,
      cm3: 0.001,    // 1 cm^3 = 1 mL = 0.001 L
      gal_us: 3.785411784,
      gal_uk: 4.54609,
      fl_oz: 0.0295735295625,
      pint: 0.473176473,
      quart: 0.946352946,
      barrel: 158.987294928
    },

    // TIME: base seconds
    time: {
      ms: 0.001,
      s: 1,
      min: 60,
      hr: 3600,
      day: 86400,
      week: 604800,
      month: 2629746, // average month in seconds (~30.436875 days)
      year: 31556952,
      decade: 315569520,
      century: 3155695200
    },

    // ENERGY: base joule (J)
    energy: {
      J: 1,
      kJ: 1e3,
      cal: 4.184,
      kcal: 4184,
      eV: 1.602176634e-19,
      Wh: 3600,
      kWh: 3.6e6,
      BTU: 1055.05585262
    },

    // POWER: base watt (W)
    power: {
      W: 1,
      kW: 1000,
      hp: 745.699872,   // mechanical hp
      BTU_h: 0.29307107017 // 1 BTU/h in W
    },

    // ELECTRICITY simple scaling (for V, A, ohm)
    electricity: {
      V: 1,
      mV: 1e-3,
      kV: 1000,
      A: 1,
      mA: 1e-3,
      ohm: 1,
      kohm: 1e3,
      Mohm: 1e6
      // Wh and Ah are handled specially below
    },

    // DATA STORAGE binary (base bytes). We'll map unit->bytes
    data: (function () {
      const map = { bit: 1 / 8, B: 1 };
      const names = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
      for (let i = 0; i < names.length; i++) {
        map[names[i]] = Math.pow(1024, i + 1);
      }
      return map;
    })(),

    // SPEED: base m/s
    speed: {
      'm_s': 1,
      'km_h': 3.6,
      'ft_s': 0.3048,
      mph: 0.44704,
      knot: 0.514444
    },

    // PRESSURE: base Pascal (Pa)
    pressure: {
      Pa: 1,
      kPa: 1e3,
      MPa: 1e6,
      bar: 1e5,
      atm: 101325,
      psi: 6894.757293168,
      torr: 133.3223684211,
      mmHg: 133.3223684211
    },

    // ANGLE base degrees
    angle: {
      deg: 1,
      rad: 180 / Math.PI,   // factor to convert rad -> degrees (we store unit->deg)
      grad: 0.9,
      arcmin: 1 / 60,
      arcsec: 1 / 3600
    },

    // FREQUENCY: base Hz
    frequency: {
      Hz: 1,
      kHz: 1e3,
      MHz: 1e6,
      GHz: 1e9,
      // rad/s and wavelength handled specially
    },

    // CHEMISTRY: mol <-> particles uses Avogadro, g/L needs molar mass
    chemistry: {
      // we'll implement in logic branch
    },

    // FUEL: conversions handled by formulas
    fuel: {
      // L/100km <-> km/L <-> mpg are formula-based
    },

    // CONSTRUCTION (density, torque, viscosity)
    construction: {
      'g_per_cm3': 1,     // base g/cm3
      'kg_per_m3': 1000,  // 1 g/cm3 = 1000 kg/m3
      'Nm': 1,
      'ft_lb': 0.737562149277265053,
      'Pa_s': 1,
      'cP': 0.001
    },

    // ASTRONOMY: parsec, light-year, solar mass, lunar distance, g acceleration
    astronomy: {
      parsec: 3.0856775814913673e16, // meters
      ly: 9.4607e15,
      solar_mass: 1.98847e30, // kg
      lunar_distance: 384400000, // meters average
      kg: 1, // for conversion to kg
      g_acc: 9.80665 // m/s^2
    }
  };

  // ---------------------------
  // Section-specific state storage
  // ---------------------------
  // We'll keep a Map keyed by section element to hold its active state
  const SectionState = new WeakMap();

  // ---------------------------
  // Utility functions to manipulate UI
  // ---------------------------
  function find(section, selector) {
    return section.querySelector(selector);
  }

  function clearSelections(section) {
    const btns = section.querySelectorAll('.conv-btn');
    btns.forEach(b => b.classList.remove('selected-source', 'selected-target'));
    const s = SectionState.get(section) || {};
    s.source = null;
    s.target = null;
    s.valueSet = false;
    s.value = NaN;
    SectionState.set(section, s);
  }

  function setSourceBtn(section, btn) {
    // clear any existing source highlight then set this
    section.querySelectorAll('.conv-btn').forEach(b => b.classList.remove('selected-source'));
    btn.classList.add('selected-source');
    const s = SectionState.get(section) || {};
    s.source = btn.getAttribute('data-unit');
    SectionState.set(section, s);
  }

  function setTargetBtn(section, btn) {
    // clear previous target highlight then set
    section.querySelectorAll('.conv-btn').forEach(b => b.classList.remove('selected-target'));
    btn.classList.add('selected-target');
    const s = SectionState.get(section) || {};
    s.target = btn.getAttribute('data-unit');
    SectionState.set(section, s);
  }

  function showResult(section, str, isError = false) {
    const out = find(section, '.result.output');
    out.textContent = str;
    out.classList.toggle('error', !!isError);
  }

  function getInputValue(section) {
    const input = find(section, '.conv-input');
    return safeParse(input.value);
  }

  // ---------------------------
  // Conversion core functions
  // ---------------------------

  // generic factor conversion: uses FACTORS map for category
  function convertFactor(category, value, fromUnit, toUnit) {
    const map = FACTORS[category];
    if (!map) return NaN;
    const fFrom = map[fromUnit];
    const fTo = map[toUnit];
    if (fFrom === undefined || fTo === undefined) return NaN;
    // value_in_base = value * fFrom
    // target_value = (value * fFrom) / fTo
    return (value * fFrom) / fTo;
  }

  // Temperature conversions (C, K, F)
  function convertTemperature(value, from, to) {
    if (from === to) return value;
    let tempK;
    switch (from) {
      case 'C': tempK = value + 273.15; break;
      case 'K': tempK = value; break;
      case 'F': tempK = (value - 32) * (5 / 9) + 273.15; break;
      default: return NaN;
    }
    switch (to) {
      case 'C': return tempK - 273.15;
      case 'K': return tempK;
      case 'F': return (tempK - 273.15) * (9 / 5) + 32;
      default: return NaN;
    }
  }

  // Frequency/wavelength conversions (use c)
  // if from is wavelength -> Hz: f = c / λ
  // if from is Hz -> wavelength: λ = c / f
  // also scale for kHz, MHz, GHz via factors in FACTORS.frequency when used
  function convertFrequency(value, from, to) {
    // handle "wavelength" specially
    if (from === 'wavelength' && to === 'wavelength') return value;
    if (from === 'wavelength') {
      // value in meters -> Hz
      let hz = C.c / value;
      // map to requested target multiplier if needed
      if (to === 'Hz') return hz;
      if (to === 'kHz') return hz / 1e3;
      if (to === 'MHz') return hz / 1e6;
      if (to === 'GHz') return hz / 1e9;
      if (to === 'rad_s') return hz * 2 * Math.PI;
      return NaN;
    }
    // from is some frequency unit to maybe wavelength or another freq unit
    // convert from -> Hz
    let hzFrom;
    switch (from) {
      case 'Hz': hzFrom = value; break;
      case 'kHz': hzFrom = value * 1e3; break;
      case 'MHz': hzFrom = value * 1e6; break;
      case 'GHz': hzFrom = value * 1e9; break;
      case 'rad_s': hzFrom = value / (2 * Math.PI); break;
      default: return NaN;
    }
    if (to === 'wavelength') {
      return C.c / hzFrom; // meters
    }
    // convert Hz -> to unit
    switch (to) {
      case 'Hz': return hzFrom;
      case 'kHz': return hzFrom / 1e3;
      case 'MHz': return hzFrom / 1e6;
      case 'GHz': return hzFrom / 1e9;
      case 'rad_s': return hzFrom * 2 * Math.PI;
      default: return NaN;
    }
  }

  // DATA storage: FACTORS.data maps unit -> bytes
  function convertData(value, from, to) {
    const map = FACTORS.data;
    const fFrom = map[from];
    const fTo = map[to];
    if (fFrom === undefined || fTo === undefined) return NaN;
    // value * fFrom (bytes) / fTo
    return (value * fFrom) / fTo;
  }

  // ELECTRICITY Wh <-> Ah: Wh = Ah * V; Ah = Wh / V
  function convertElectricity(value, from, to, voltage = 1) {
    // treat basic scaling units via FACTORS.electricity
    const eleMap = FACTORS.electricity;
    if (from === 'Wh' && to === 'Ah') {
      // Ah = Wh / V
      if (!voltage) return NaN;
      return value / voltage;
    }
    if (from === 'Ah' && to === 'Wh') {
      return value * voltage;
    }
    // otherwise simple scaling for V/mV/kV and A/mA
    const fFrom = eleMap[from];
    const fTo = eleMap[to];
    if (fFrom !== undefined && fTo !== undefined) {
      return (value * fFrom) / fTo;
    }
    return NaN;
  }

  // CHEMISTRY: mol <-> particles (N_A), mol <-> g (needs molar mass)
  function convertChemistry(value, from, to, molarMass) {
    if (from === to) return value;
    if (from === 'mol' && to === 'particles') return value * C.N_A;
    if (from === 'particles' && to === 'mol') return value / C.N_A;
    // mol <-> g/L: molarity to g/L using molar mass (g/mol)
    if ((from === 'mol' && to === 'g_per_L') || (from === 'g_per_L' && to === 'mol')) {
      if (!molarMass || !isFinite(molarMass)) return NaN;
      if (from === 'mol' && to === 'g_per_L') return value * molarMass;
      if (from === 'g_per_L' && to === 'mol') return value / molarMass;
    }
    // atm <-> kPa: 1 atm = 101.325 kPa
    if ((from === 'atm' && to === 'kPa')) return value * 101.325;
    if ((from === 'kPa' && to === 'atm')) return value / 101.325;
    return NaN;
  }

  // FUEL conversions:
  // L/100km <-> km/L: km/L = 100 / (L/100km)
  // mpg (US) ↔ km/L: 1 mpg(US) = 0.4251437075 km/L
  function convertFuel(value, from, to) {
    if (from === to) return value;
    // km/L <-> L/100km
    if (from === 'km_per_L' && to === 'L_per_100km') return 100 / value;
    if (from === 'L_per_100km' && to === 'km_per_L') return 100 / value;
    // mpg conversions
    const mpg_us_to_kmL = 0.4251437075;
    const mpg_uk_to_kmL = 0.354006; // approx
    if (from === 'mpg_us' && to === 'km_per_L') return value * mpg_us_to_kmL;
    if (from === 'mpg_uk' && to === 'km_per_L') return value * mpg_uk_to_kmL;
    if (from === 'km_per_L' && to === 'mpg_us') return value / mpg_us_to_kmL;
    if (from === 'km_per_L' && to === 'mpg_uk') return value / mpg_uk_to_kmL;
    // between mpg_us and mpg_uk
    if (from === 'mpg_us' && to === 'mpg_uk') return (value * mpg_us_to_kmL) / mpg_uk_to_kmL;
    if (from === 'mpg_uk' && to === 'mpg_us') return (value * mpg_uk_to_kmL) / mpg_us_to_kmL;
    return NaN;
  }

  // CONSTRUCTION conversions via FACTORS.construction map
  function convertConstruction(value, from, to) {
    const map = FACTORS.construction;
    const fFrom = map[from];
    const fTo = map[to];
    if (fFrom === undefined || fTo === undefined) return NaN;
    return (value * fFrom) / fTo;
  }

  // ASTRONOMY conversions (some map to meters or kg)
  function convertAstronomy(value, from, to) {
    const map = FACTORS.astronomy;
    // If converting parsec/ly/lunar_distance <-> meters or kg (solar_mass)
    if (map[from] !== undefined && map[to] !== undefined) {
      // Some units share same base (we'll convert via meters or kg)
      // If both map to meters (parsec, ly, lunar_distance) we compute ratio
      const fFrom = map[from];
      const fTo = map[to];
      return (value * fFrom) / fTo;
    }
    // e.g., solar_mass <-> kg
    if (from === 'solar_mass' && to === 'kg') return value * map.solar_mass;
    if (from === 'kg' && to === 'solar_mass') return value / map.solar_mass;
    // g_acc conversions: treat g_acc as acceleration value (1 g = 9.80665 m/s^2)
    if (from === 'g_acc' && to === 'm_s2') return value * map.g_acc;
    if (from === 'm_s2' && to === 'g_acc') return value / map.g_acc;
    return NaN;
  }

  // ---------------------------
  // Main compute dispatcher
  // ---------------------------
  function computeConversion(section) {
    const s = SectionState.get(section) || {};
    const { source, target, valueSet, value } = s;
    if (!source) {
      showResult(section, 'Select a source unit first.', true);
      return;
    }
    if (!target) {
      showResult(section, 'Select a target unit (click) to convert.', true);
      return;
    }
    if (!valueSet || !isFinite(value)) {
      showResult(section, 'Enter a valid number (press Enter).', true);
      return;
    }

    const cat = section.getAttribute('data-cat');

    let result = NaN;
    switch (cat) {
      case 'length':
        result = convertFactor('length', value, source, target); break;
      case 'mass':
        result = convertFactor('mass', value, source, target); break;
      case 'area':
        result = convertFactor('area', value, source, target); break;
      case 'volume':
        result = convertFactor('volume', value, source, target); break;
      case 'time':
        result = convertFactor('time', value, source, target); break;
      case 'temperature':
        result = convertTemperature(value, source, target); break;
      case 'energy':
        result = convertFactor('energy', value, source, target); break;
      case 'power':
        result = convertFactor('power', value, source, target); break;
      case 'electricity':
        {
          // voltage input may be present
          const vInput = section.querySelector('.voltage-input');
          const voltage = vInput ? safeParse(vInput.value) || 1 : 1;
          // If both are Wh/Ah or vice versa, use special handler
          if ((source === 'Wh' && target === 'Ah') || (source === 'Ah' && target === 'Wh')) {
            result = convertElectricity(value, source, target, voltage);
          } else {
            result = convertElectricity(value, source, target, voltage);
          }
        }
        break;
      case 'data':
        result = convertData(value, source, target); break;
      case 'speed':
        result = convertFactor('speed', value, source, target); break;
      case 'pressure':
        result = convertFactor('pressure', value, source, target); break;
      case 'angle':
        // FACTORS.angle maps units -> degrees; use that
        {
          const map = FACTORS.angle;
          const fFrom = map[source];
          const fTo = map[target];
          if (fFrom === undefined || fTo === undefined) result = NaN;
          else result = (value * fFrom) / fTo;
        }
        break;
      case 'frequency':
        result = convertFrequency(value, source, target); break;
      case 'chemistry':
        {
          const mmInput = section.querySelector('.molar-mass-input');
          const molarMass = mmInput ? safeParse(mmInput.value) : NaN;
          result = convertChemistry(value, source, target, molarMass);
        }
        break;
      case 'fuel':
        result = convertFuel(value, source, target); break;
      case 'construction':
        result = convertConstruction(value, source, target); break;
      case 'astronomy':
        result = convertAstronomy(value, source, target); break;
      default:
        result = NaN;
    }

    if (!isFinite(result)) {
      showResult(section, 'Conversion not supported / missing parameter.', true);
      return;
    }

    // Format output as "<input> SRC = <result> TGT"
    const out = `${fmtValue(value)} ${source} = ${fmtValue(result)} ${target}`;
    showResult(section, out, false);
  }

  // ---------------------------
  // UI Binding per section
  // ---------------------------
  function setupSection(section) {
    // initialize state
    SectionState.set(section, { source: null, target: null, valueSet: false, value: NaN });

    const input = find(section, '.conv-input');
    const unitButtons = Array.from(section.querySelectorAll('.conv-btn'));
    const swapBtn = find(section, '.swap-btn');
    const clearBtn = find(section, '.clear-btn');
    const output = find(section, '.result.output');

    // Clicking unit buttons: first click is source if none set; otherwise if source set and valueSet true, set target and compute
    unitButtons.forEach(btn => {
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        const s = SectionState.get(section) || {};
        const unit = btn.getAttribute('data-unit');

        // if source not selected -> set source
        if (!s.source) {
          setSourceBtn(section, btn);
          showResult(section, `Source set: ${unit}`);
          s.source = unit;
          SectionState.set(section, s);
          return;
        }

        // if clicked same as source and target not set -> treat as target (identity)
        if (!s.target && s.source === unit && s.valueSet) {
          setTargetBtn(section, btn);
          s.target = unit;
          SectionState.set(section, s);
          computeConversion(section);
          return;
        }

        // If source exists and target not set -> set target and compute (if valueSet)
        if (s.source && (!s.target || s.target !== unit)) {
          setTargetBtn(section, btn);
          s.target = unit;
          SectionState.set(section, s);
          // compute only if value is set
          if (s.valueSet) computeConversion(section);
          else showResult(section, `Target set: ${unit} — enter value & press Enter to convert.`);
          return;
        }

        // If both source and target are set and clicked same as source -> reselect source (no-op)
        // If user wants to change source after both set, allow clicking a different button to reset source and clear target
        if (s.source && s.target) {
          // If clicked a unit that is neither source nor target, treat as changing source (clear previous selections)
          if (unit !== s.source && unit !== s.target) {
            clearSelections(section);
            setSourceBtn(section, btn);
            s.source = unit;
            s.target = null;
            s.valueSet = false;
            s.value = NaN;
            SectionState.set(section, s);
            showResult(section, `Source changed to ${unit}.`);
            return;
          }
          // If clicked the target again -> recompute
          if (unit === s.target && s.valueSet) {
            computeConversion(section);
            return;
          }
        }
      });
    });

    // Enter key on input sets the value for the section (must parse numeric)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const s = SectionState.get(section) || {};
        const n = safeParse(input.value);
        if (!isFinite(n)) {
          showResult(section, 'Enter a valid numeric value (not empty).', true);
          s.valueSet = false;
          s.value = NaN;
          SectionState.set(section, s);
          return;
        }
        s.value = n;
        s.valueSet = true;
        SectionState.set(section, s);
        // If both source and target set already, compute immediately
        if (s.source && s.target) {
          computeConversion(section);
        } else if (s.source && !s.target) {
          showResult(section, `Value set: ${fmtValue(n)} — now click a target unit.`);
        } else {
          showResult(section, `Value set: ${fmtValue(n)} — click a source unit first.`);
        }
      }
    });

    // Swap button logic: swap source <-> target and recompute if possible
    if (swapBtn) {
      swapBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const s = SectionState.get(section) || {};
        if (!s.source || !s.target) {
          showResult(section, 'Need both source and target to swap.', true);
          return;
        }
        // find current source and target buttons
        const srcBtn = section.querySelector(`.conv-btn[data-unit="${s.source}"]`);
        const tgtBtn = section.querySelector(`.conv-btn[data-unit="${s.target}"]`);
        if (!srcBtn || !tgtBtn) {
          showResult(section, 'Swap failed (buttons missing).', true);
          return;
        }
        // swap highlights
        srcBtn.classList.remove('selected-source');
        tgtBtn.classList.remove('selected-target');
        srcBtn.classList.add('selected-target');
        tgtBtn.classList.add('selected-source');

        // swap the names in state
        const oldSource = s.source;
        s.source = s.target;
        s.target = oldSource;
        SectionState.set(section, s);

        // recompute if value available
        if (s.valueSet) computeConversion(section);
        else showResult(section, `Swapped. Source is now ${s.source}. Enter value & press Enter.`);
      });
    }

    // Clear button clears everything for the section
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // clear selections and input and output
        clearSelections(section);
        if (input) input.value = '';
        const mmInput = section.querySelector('.molar-mass-input');
        if (mmInput) mmInput.value = '';
        const vInput = section.querySelector('.voltage-input');
        if (vInput) vInput.value = '';
        showResult(section, '');
      });
    }
  }

  // ---------------------------
  // Initialize all sections on DOM ready
  // ---------------------------
  document.addEventListener('DOMContentLoaded', () => {
    const sections = Array.from(document.querySelectorAll('.stage'));
    sections.forEach(sec => {
      setupSection(sec);
    });

    // Expand/collapse controls (optional simple behavior: scroll)
    const expandAll = document.getElementById('expandAll');
    const collapseAll = document.getElementById('collapseAll');
    if (expandAll) {
      expandAll.addEventListener('click', (e) => {
        e.preventDefault();
        // scroll top to bottom (simulate expand)
        const grid = document.getElementById('sectionsGrid');
        if (grid) grid.scrollTop = 0;
      });
    }
    if (collapseAll) {
      collapseAll.addEventListener('click', (e) => {
        e.preventDefault();
        const grid = document.getElementById('sectionsGrid');
        if (grid) grid.scrollTop = 0;
      });
    }
  });

  // ---------------------------
  // Expose for debugging (optional)
  // ---------------------------
  window._YuvaConversion = {
    fmtValue,
    FACTORS,
    computeConversionForTesting: (cat, value, from, to, extra) => {
      // convenience test harness
      switch (cat) {
        case 'length': return convertFactor('length', value, from, to);
        case 'mass': return convertFactor('mass', value, from, to);
        case 'area': return convertFactor('area', value, from, to);
        case 'volume': return convertFactor('volume', value, from, to);
        case 'time': return convertFactor('time', value, from, to);
        case 'temperature': return convertTemperature(value, from, to);
        case 'energy': return convertFactor('energy', value, from, to);
        case 'power': return convertFactor('power', value, from, to);
        case 'electricity': return convertElectricity(value, from, to, extra && extra.voltage);
        case 'data': return convertData(value, from, to);
        case 'speed': return convertFactor('speed', value, from, to);
        case 'pressure': return convertFactor('pressure', value, from, to);
        case 'frequency': return convertFrequency(value, from, to);
        case 'chemistry': return convertChemistry(value, from, to, extra && extra.molarMass);
        case 'fuel': return convertFuel(value, from, to);
        case 'construction': return convertConstruction(value, from, to);
        case 'astronomy': return convertAstronomy(value, from, to);
        default: return NaN;
      }
    }
  };

})();
