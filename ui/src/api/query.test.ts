import { Query, getQueryString } from './query';

test('transform query object to GET parameters', () => {

    const query: Query = {
        q: '*',
        filters: [
            {
                field: 'field1',
                value: 'value1'
            },
            {
                field: 'field2',
                value: 'value2'
            }
        ],
        not: [
            {
                field: 'field3',
                value: 'value3'
            },
            {
                field: 'field4',
                value: 'value4'
            }
        ],
        exists: ['field5', 'field6'],
        size: 42,
        from: 23
    };

    const result = getQueryString(query);
    expect(result.length).toBeGreaterThan(0);

    const splitResult = result.split('&');

    expect(splitResult).toContain('filters[]=field1:value1');
    expect(splitResult).toContain('filters[]=field2:value2');
    expect(splitResult).toContain('not[]=field3:value3');
    expect(splitResult).toContain('not[]=field4:value4');
    expect(splitResult).toContain('exists[]=field5');
    expect(splitResult).toContain('exists[]=field6');
    expect(splitResult).toContain('size=42');
    expect(splitResult).toContain('from=23');

});
