function update(data, tourings, setTourings) {
    const newTourings = tourings.map(touring => touring.id === data.id ? data : touring);
    setTourings(newTourings);
}

export default { update }