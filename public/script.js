document.addEventListener("DOMContentLoaded", () => {
    const seats = document.querySelectorAll(".seat");
    const selectedSeatsEl = document.getElementById("selectedSeats");
    const bookButton = document.getElementById("bookSeats");
    const datePicker = document.getElementById("datePicker");
    const timePicker = document.getElementById("timePicker");
    const seatSection = document.getElementById("seatSection");

    let selectedSeats = JSON.parse(localStorage.getItem("selectedSeats")) || {};
    let selectedDate = null;
    let selectedTime = null;

    function setMinMaxDate() {
        const today = new Date();
        const minDate = new Date(today);
        const maxDate = new Date(today);
        minDate.setDate(today.getDate() - 7);
        maxDate.setDate(today.getDate() + 7);

        datePicker.setAttribute("min", minDate.toISOString().split("T")[0]);
        datePicker.setAttribute("max", maxDate.toISOString().split("T")[0]);

        cleanOldArchive(minDate);
    }

    function cleanOldArchive(minAllowedDate) {
        const keys = Object.keys(selectedSeats);
        keys.forEach(key => {
            const datePart = key.split("_")[0];
            if (new Date(datePart) < minAllowedDate) {
                delete selectedSeats[key];
            }
        });
        localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
    }

    function isPastDateTime(date, time) {
        const selectedDateTime = new Date(`${date}T${time}`);

        return selectedDateTime < new Date();
    }

    function updateSeatDisplay() {
        const dateTimeKey = `${selectedDate}_${selectedTime}`;
        const bookedSeats = selectedSeats[dateTimeKey] || [];
        const minDate = new Date();
        const maxDate = new Date();
        const selectedDateObj = new Date(selectedDate);

        if (!selectedDate || !selectedTime) {
            seatSection.style.display = "none";

            return;
        }

        minDate.setDate(minDate.getDate() - 7);
        maxDate.setDate(maxDate.getDate() + 7);


        if (selectedDateObj < minDate || selectedDateObj > maxDate) {
            seatSection.style.display = "none";

            return;
        }

        seatSection.style.display = "block";

        seats.forEach(seat => {
            const seatId = seat.dataset.seat;
            seat.classList.toggle("booked", bookedSeats.includes(seatId));

            if (isPastDateTime(selectedDate, selectedTime)) {
                seat.classList.add("archived");
                seat.removeEventListener("click", handleSeatClick);
            } else {
                seat.classList.remove("archived");
                seat.addEventListener("click", handleSeatClick);
            }
        });

        selectedSeatsEl.textContent = bookedSeats.length ? bookedSeats.join(", ") : "None";
        bookButton.disabled = isPastDateTime(selectedDate, selectedTime);
    }

    function handleSeatClick(event) {
        if (!selectedDate || !selectedTime) {
            alert("Please select a date and time first.");

            return;
        }

        const dateTimeKey = `${selectedDate}_${selectedTime}`;
        if (!selectedSeats[dateTimeKey]) {
            selectedSeats[dateTimeKey] = [];
        }

        const seatId = event.target.dataset.seat;
        const bookedSeats = selectedSeats[dateTimeKey];

        if (bookedSeats.includes(seatId)) {
            selectedSeats[dateTimeKey] = bookedSeats.filter(s => s !== seatId);
        } else {
            bookedSeats.push(seatId);
        }

        localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
        updateSeatDisplay();
    }

    datePicker.addEventListener("change", (event) => {
        selectedDate = event.target.value;
        selectedTime = null;
        updateSeatDisplay();
    });

    if (timePicker) {
        timePicker.addEventListener("change", (event) => {
            selectedTime = event.target.value;
            updateSeatDisplay();
        });
    } else {
        console.error("Element #timePicker not found in the document!");
    }

    bookButton.addEventListener("click", () => {
        if (selectedDate && selectedTime) {
            alert(`Seats booked for ${selectedDate} at ${selectedTime}`);
        }
    });

    setMinMaxDate();
});