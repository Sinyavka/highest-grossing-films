document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('tableBody');
    const filterCountry = document.getElementById('filterCountry');
    let currentSort = { column: null, asc: true };
    let movies = [];

    async function loadData() {
        try {
            const response = await fetch('highest_grossing_films.json');
            if (!response.ok) throw new Error('Network response was not ok');
            movies = await response.json();
            init();
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load movie data');
        }
    }

    function init() {
        populateCountryFilter();
        renderTable(movies);
        addEventListeners();
    }

    function populateCountryFilter() {
        const countries = [...new Set(movies.flatMap(movie => 
            movie.country.split(', ')))];
        
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            filterCountry.appendChild(option);
        });
    }

    function renderTable(data) {
        tableBody.innerHTML = '';
        data.forEach(movie => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${movie.title}</td>
                <td>${movie.year}</td>
                <td>${movie.director}</td>
                <td>${movie.country}</td>
                <td class="box-office">$${formatNumber(movie.box_office)}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function sortTable(column) {
        const isAsc = currentSort.column === column ? !currentSort.asc : true;
        
        const sorted = [...movies].sort((a, b) => {
            if (typeof a[column] === 'number') {
                return isAsc ? a[column] - b[column] : b[column] - a[column];
            }
            return isAsc 
                ? a[column].localeCompare(b[column]) 
                : b[column].localeCompare(a[column]);
        });

        currentSort = { column, asc: isAsc };
        renderTable(sorted);
        updateSortButtons(column, isAsc);
    }

    function updateSortButtons(column, isAsc) {
        document.querySelectorAll('[data-sort]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.sort === column) {
                btn.classList.add('active');
                btn.textContent = `Sort by ${btn.dataset.sort.replace('_', ' ')} ${isAsc ? '↑' : '↓'}`;
            } else {
                btn.textContent = `Sort by ${btn.dataset.sort.replace('_', ' ')}`;
            }
        });
    }

    function filterTable() {
        const country = filterCountry.value;
        const filtered = country 
            ? movies.filter(movie => movie.country.includes(country))
            : movies;
        renderTable(filtered);
    }

    function addEventListeners() {
        document.querySelectorAll('[data-sort]').forEach(btn => {
            btn.addEventListener('click', () => sortTable(btn.dataset.sort));
        });

        filterCountry.addEventListener('change', filterTable);
    }

    loadData();
});