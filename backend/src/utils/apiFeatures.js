class ApiFeatures {
    // query: Mongoose query object
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // 1- Search by username or phone number
    search() {
        // Extract the keyword from the query string
        const keyword = this.queryString.keyword;

        // If keyword exists, search for users where username or phone number matches the keyword (case-insensitive)
        if (keyword) {
            let searchQuery = {};
            searchQuery.$or = [
                {username: { $regex: keyword, $options: 'i' }},
                {phoneNumber: { $regex: keyword, $options: 'i' }}
            ]

            this.query = this.query.find(searchQuery);
        }

        // Return the instance to allow method chaining
        return this;
    }

    // 2- Pagination
    paginate(countDocs) {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;
        const endIndex = page * limit;

        // Apply skip and limit to the Mongoose query for pagination
        this.query = this.query.skip(skip).limit(limit);

        // Calculate pagination details
        const pagination = {};
        pagination.currentPage = page;
        pagination.numberOfPages = Math.ceil(countDocs / limit);
        pagination.limit = limit;

        if(endIndex < countDocs) pagination.nextPage = page + 1;
        if(skip > 0) pagination.prevPage = page - 1;

        this.paginationResult = pagination;

        // Return the instance to allow method chaining
        return this;
    }
}

module.exports = ApiFeatures;