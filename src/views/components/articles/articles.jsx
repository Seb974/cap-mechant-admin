import React, { useEffect, useState } from 'react';
import ArticleActions from '../../../services/ArticleActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Articles = (props) => {

    const itemsPerPage = 15;
    const fields = ['name', ' '];
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        ArticleActions.findAll()
            .then(response => {
                console.log(response);
                setArticles(response);
            })
            .catch(error => console.log(error));
    }, []);

    const handleDelete = (id) => {
        const originalArticles = [...articles];
        setArticles(articles.filter(article => article.id !== id));
        ArticleActions
            .delete(id)
            .catch(error => {
                setArticles(originalArticles);
                console.log(error.response);
            });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des articles de blog
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/articles/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ articles }
              fields={ fields }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination
              scopedSlots = {{
                'name':
                  item => <td><Link to={ "/components/articles/" + item.id }>{ item.title }</Link></td>
                ,
                ' ':
                  item =><td><CButton block color="danger" onClick={ () => handleDelete(item.id) }>Supprimer</CButton></td>
              }}
            />
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Articles;