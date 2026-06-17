import React, { useState, useMemo } from 'react';

// --- FUNCIONES PURAS DE FECHAS ---
const getTodayLocal = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const parseDateLocal = (dateString) => {
  if (!dateString) return null;
  const [y, m, d] = dateString.split('-');
  return new Date(y, m - 1, d);
};

const formatDateLocal = (dateObj) => {
  if (!dateObj) return '';
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const isDateInPast = (date) => {
  return date < getTodayLocal();
};

// --- SUBCONENTES VISUALES ---
const EncabezadoMes = ({ mesActual, onPrevMes, onNextMes }) => {
  const mesesStr = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  return (
    <div className="flex items-center justify-between mb-4">
      <button onClick={onPrevMes} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors" type="button">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <h3 className="font-semibold text-[var(--color-primary)]">
        {mesesStr[mesActual.getMonth()]} {mesActual.getFullYear()}
      </h3>
      <button onClick={onNextMes} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors" type="button">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
};

const NombresDiasSemana = () => (
  <div className="grid grid-cols-7 mb-2">
    {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(dia => (
      <div key={dia} className="text-center text-xs font-semibold text-[var(--color-muted)] py-1">{dia}</div>
    ))}
  </div>
);

const DiaCuadricula = ({ 
  fecha, isPast, isOccupied, isStart, isEnd, isInRange, onDateSelect 
}) => {
  const isDisabled = isPast || isOccupied;
  
  let baseClasses = "w-full h-10 flex items-center justify-center text-sm rounded-full transition-colors relative z-10 ";
  let wrapperClasses = "relative p-0.5 ";

  if (isDisabled) {
    baseClasses += isOccupied ? "bg-red-50 text-red-400 line-through cursor-not-allowed" : "text-gray-300 cursor-not-allowed";
  } else {
    baseClasses += "cursor-pointer font-medium ";
    if (isStart || isEnd) baseClasses += "bg-[var(--color-accent)] text-white hover:opacity-90 shadow-md";
    else if (isInRange) baseClasses += "bg-red-100 text-[var(--color-accent)] hover:bg-red-200";
    else baseClasses += "text-[var(--color-text)] hover:bg-gray-100";
  }

  // Fondos visuales para conectar el rango
  if (isStart && !isEnd && isInRange) wrapperClasses += "after:absolute after:right-0 after:top-0.5 after:bottom-0.5 after:left-1/2 after:bg-red-100 after:z-0";
  if (isEnd && !isStart && isInRange) wrapperClasses += "after:absolute after:left-0 after:top-0.5 after:bottom-0.5 after:right-1/2 after:bg-red-100 after:z-0";
  if (isInRange && !isStart && !isEnd) wrapperClasses += "bg-red-100 rounded-none";

  return (
    <div className={wrapperClasses}>
      <button
        type="button"
        disabled={isDisabled}
        onClick={(e) => { e.preventDefault(); onDateSelect(fecha); }}
        className={baseClasses}
      >
        {fecha.getDate()}
      </button>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function CalendarioReservas({ 
  reservasExistentes = [], 
  fechaInicio, 
  fechaFin, 
  onFechasSeleccionadas 
}) {
  const startObj = parseDateLocal(fechaInicio);
  const endObj = parseDateLocal(fechaFin);
  
  const [mesActual, setMesActual] = useState(() => {
    const initialMonthDate = startObj || getTodayLocal();
    return new Date(initialMonthDate.getFullYear(), initialMonthDate.getMonth(), 1);
  });
  
  const [errorMessage, setErrorMessage] = useState('');

  // --- LÓGICA DE VALIDACIÓN INTERNA ---
  
  // Memoizamos el parseo de las reservas para no recalcular en cada renderizado
  const rangosReservados = useMemo(() => {
    return reservasExistentes.map((res) => ({
      inicio: parseDateLocal(res.inicio),
      fin: parseDateLocal(res.fin),
    }));
  }, [reservasExistentes]);

  const isDateOccupied = (date) => {
    return rangosReservados.some((rango) => date >= rango.inicio && date <= rango.fin);
  };

  const isRangeValid = (startDate, endDate) => {
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (isDateOccupied(currentDate)) return false;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return true;
  };

  // --- MANEJADORES DE EVENTOS ---
  
  const handleDateSelection = (selectedDate) => {
    setErrorMessage('');
    const selectedDateStr = formatDateLocal(selectedDate);

    // Reiniciar selección si no hay inicio, ya hay un rango completo, o si eligen una fecha anterior al inicio
    if (!startObj || (startObj && endObj) || selectedDate < startObj) {
      onFechasSeleccionadas({ inicio: selectedDateStr, fin: '' });
      return;
    }

    // Validar que el rango no pise una reserva existente
    if (!isRangeValid(startObj, selectedDate)) {
      setErrorMessage('El rango seleccionado incluye días ya reservados.');
      onFechasSeleccionadas({ inicio: selectedDateStr, fin: '' });
      return;
    }

    onFechasSeleccionadas({ inicio: fechaInicio, fin: selectedDateStr });
  };

  const handlePrevMes = (e) => { 
    e.preventDefault(); 
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1)); 
  };
  
  const handleNextMes = (e) => { 
    e.preventDefault(); 
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1)); 
  };

  // --- GENERACIÓN DE LA CUADRÍCULA ---
  
  const daysInMonth = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1).getDay();
  const gridDays = Array.from({ length: firstDayOfWeek }, () => null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => new Date(mesActual.getFullYear(), mesActual.getMonth(), i + 1)));

  return (
    <div className="w-full max-w-sm bg-white border border-[var(--color-border)] rounded-xl shadow-sm p-4">
      <EncabezadoMes 
        mesActual={mesActual} 
        onPrevMes={handlePrevMes} 
        onNextMes={handleNextMes} 
      />
      
      <NombresDiasSemana />

      <div className="grid grid-cols-7 gap-y-1">
        {gridDays.map((fecha, idx) => {
          if (!fecha) return <div key={`empty-${idx}`} className="p-2"></div>;

          return (
            <DiaCuadricula
              key={fecha.toISOString()}
              fecha={fecha}
              isPast={isDateInPast(fecha)}
              isOccupied={isDateOccupied(fecha)}
              isStart={startObj && fecha.getTime() === startObj.getTime()}
              isEnd={endObj && fecha.getTime() === endObj.getTime()}
              isInRange={startObj && endObj && fecha >= startObj && fecha <= endObj}
              onDateSelect={handleDateSelection}
            />
          );
        })}
      </div>

      {errorMessage && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg text-center font-medium">
          {errorMessage}
        </div>
      )}
    </div>
  );
}