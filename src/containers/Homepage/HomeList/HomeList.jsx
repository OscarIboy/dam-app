/*
 * @copyright   Copyright (C) 2022 AesirX. All rights reserved.
 * @license     GNU General Public License version 3, see LICENSE.
 */

import React, { Component } from 'react';
import '../index.scss';

import {
  DAM_ASSETS_API_FIELD_KEY,
  DAM_ASSETS_FIELD_KEY,
  DAM_COLLECTION_FIELD_KEY,
} from 'aesirx-lib';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import ComponentNoData from 'components/ComponentNoData';
import { Spinner, PAGE_STATUS, history, Image } from 'aesirx-uikit';
import Table from 'components/Table';
import { DAM_COLUMN_INDICATOR } from 'constants/DamConstant';
import styles from '../index.module.scss';
import utils from '../HomeUtils/HomeUtils';
import { withDamViewModel } from 'store/DamStore/DamViewModelContextProvider';
import moment from 'moment';
import CollectionName from '../HomeForm/CollectionName';

const HomeList = observer(
  class HomeList extends Component {
    damListViewModel = null;
    damformModalViewModal = null;

    constructor(props) {
      super(props);
      const { viewModel } = props;
      this.viewModel = viewModel ? viewModel : null;
      this.damListViewModel = this.viewModel ? this.viewModel.getDamListViewModel() : null;
      this.damFormModalViewModal = this.viewModel ? this.viewModel.getDamFormViewModel() : null;
    }

    componentDidMount() {
      document.addEventListener('mousedown', this.handleClickOutside);
      const collectionId = history.location.pathname.split('/');
      const currentCollectionId = !isNaN(collectionId[collectionId.length - 1])
        ? collectionId[collectionId.length - 1]
        : 0;
      this.damListViewModel.setLoading();
      this.damListViewModel.goToFolder(currentCollectionId);
    }

    componentWillUnmount() {
      document.removeEventListener('mousedown', this.handleClickOutside);
    }

    componentDidUpdate(prevProps) {
      if (this.props.location !== prevProps.location) {
        const collectionId = history.location.pathname.split('/');
        const currentCollectionId = !isNaN(collectionId[collectionId.length - 1])
          ? collectionId[collectionId.length - 1]
          : 0;
        this.damListViewModel.goToFolder(currentCollectionId);
      }
    }

    handleClickOutside = (e) => {
      const checkContextMenu = e.target.closest('#contextMenu');
      const checkContextMenuItem = e.target.closest('#contextMenuItem');
      const checkContextItemMoveToFolder = e.target.closest('#contextMenuItemMoveToFolder');

      if (checkContextMenu || checkContextMenuItem || checkContextItemMoveToFolder) {
        return;
      } else {
        this.damFormModalViewModal.closeContextMenu();
        this.damFormModalViewModal.closeContextMenuItem();
        this.damFormModalViewModal.closeMoveToFolder();
      }
    };

    handleSelect = (data) => {
      this.damListViewModel.damIdsSelected = data
        .map((item) => {
          return item[this.key];
        })
        .reduce((arr, el) => {
          return arr.concat(el);
        }, []);
    };

    handleCreateAssets = (data) => {
      if (data) {
        const collectionId = history.location.pathname.split('/');
        const currentCollection = !isNaN(collectionId[collectionId.length - 1])
          ? collectionId[collectionId.length - 1]
          : 0;

        this.damListViewModel.createAssets({
          [DAM_ASSETS_API_FIELD_KEY.NAME]: data?.name ?? '',
          [DAM_ASSETS_API_FIELD_KEY.FILE_NAME]: data?.name ?? '',
          [DAM_ASSETS_API_FIELD_KEY.COLLECTION_ID]: currentCollection,
          [DAM_ASSETS_API_FIELD_KEY.FILE]: data,
        });
      }
    };

    _handleList = () => {
      this.damListViewModel.isList = !this.damListViewModel.isList;
    };

    handleDoubleClick = (collection) => {
      if (!collection?.[DAM_ASSETS_FIELD_KEY.TYPE]) {
        history.push(history.location.pathname + '/' + collection.id);
      } else {
        this.damFormModalViewModal.damEditdata = {
          ...collection,
        };
        this.damFormModalViewModal.openModal();
      }
    };

    handleRightClick = (e) => {
      e.preventDefault();
      const inside = e.target.closest('.item_thumb');
      if (!inside) {
        this.damFormModalViewModal.closeContextMenuItem();
        this.damListViewModel.setActionState({
          selectedCards: [],
        });
        const innerHeight = window.innerHeight;
        const innerWidth = window.innerWidth;
        let style = {
          transition: 'none',
          top: e.clientY,
          left: e.clientX,
        };
        if (e.clientX + 200 > innerWidth) {
          style = {
            ...style,
            right: innerWidth - e.clientX,
            left: 'unset',
          };
        }
        if (e.clientY + 260 > innerHeight) {
          style = {
            ...style,
            bottom: innerHeight - e.clientY,
            top: 'unset',
          };
        }

        this.damListViewModel.setActionState({
          style: style,
        });
        this.damFormModalViewModal.openContextMenu();
      }
    };

    handleClickOutSite = (e) => {
      e.preventDefault();
      const inside = e.target.closest('.item_thumb');
      const checkChooseAction = e.target.closest('.choose-an-action');
      if (!inside && !checkChooseAction) {
        this.damListViewModel.setActionState({
          selectedCards: [],
        });
      }
    };

    handleRightClickItem = (e, data) => {
      e.preventDefault();
      this.damFormModalViewModal.closeContextMenu();
      const innerHeight = window.innerHeight;
      const innerWidth = window.innerWidth;
      let style = {
        transition: 'none',
        top: e.clientY,
        left: e.clientX,
      };
      if (e.clientX + 200 > innerWidth) {
        style = {
          ...style,
          right: innerWidth - e.clientX,
          left: 'unset',
        };
      }
      if (e.clientY + 260 > innerHeight) {
        style = {
          ...style,
          bottom: innerHeight - e.clientY,
          top: 'unset',
        };
      }

      this.damFormModalViewModal.damEditdata = {
        ...data,
        style: { ...style },
      };
      this.damListViewModel.setActionState({
        style: style,
      });
      this.handleItemSelection(data.index, false, false, false, true);
      this.damFormModalViewModal.openContextMenuItem();
    };

    handleFilter = (data) => {
      const collectionId = history.location.pathname.split('/');
      const currentCollection = !isNaN(collectionId[collectionId.length - 1])
        ? collectionId[collectionId.length - 1]
        : 0;
      this.damListViewModel.onFilter(currentCollection, {
        'filter[type]': data.value,
      });
    };

    handleSortBy = (data) => {
      const collectionId = history.location.pathname.split('/');
      const currentCollection = !isNaN(collectionId[collectionId.length - 1])
        ? collectionId[collectionId.length - 1]
        : 0;
      this.damListViewModel.onFilter(
        currentCollection,
        {
          'list[ordering]': data.value.ordering,
          'list[direction]': data.value.direction,
        },
        true
      );
    };

    clearItemSelection = () => {
      // dispatch({ type: "CLEAR_SELECTION" });
    };

    handleItemSelection = (index, cmdKey, shiftKey, ctrlKey, contextClick = false) => {
      const { assets, collections, isSearch } = this.damListViewModel;
      const collectionId = history.location.pathname.split('/');

      let handleCollections = [];
      let handleAssets = [];
      if (!isNaN(+collectionId[collectionId.length - 1])) {
        handleAssets = assets.filter(
          (asset) =>
            +asset[DAM_ASSETS_FIELD_KEY.COLLECTION_ID] === +collectionId[collectionId.length - 1]
        );

        handleCollections = collections.filter(
          (collection) =>
            +collection[DAM_COLLECTION_FIELD_KEY.PARENT_ID] ===
            +collectionId[collectionId.length - 1]
        );
      } else {
        if (isSearch) {
          handleAssets = assets;
          handleCollections = collections;
        } else {
          handleAssets = assets.filter((asset) => +asset[DAM_ASSETS_FIELD_KEY.COLLECTION_ID] === 0);

          handleCollections = collections.filter(
            (collection) => collection[DAM_COLLECTION_FIELD_KEY.PARENT_ID] === 0
          );
        }
      }
      let newSelectedCards = [];

      const cards = [...handleCollections, ...handleAssets].map((item, i) => ({
        ...item,
        index: i,
      }));
      const card = index < 0 ? '' : cards[index];
      const newLastSelectedIndex = index;
      if (!cmdKey && !shiftKey && !ctrlKey && !contextClick) {
        newSelectedCards = [card];
      } else if (shiftKey) {
        if (this.damListViewModel.actionState.lastSelectedIndex >= index) {
          newSelectedCards = [].concat.apply(
            this.damListViewModel.actionState.selectedCards,
            cards.slice(index, this.damListViewModel.actionState.lastSelectedIndex)
          );
        } else {
          newSelectedCards = [].concat.apply(
            this.damListViewModel.actionState.selectedCards,
            cards.slice(this.damListViewModel.actionState.lastSelectedIndex + 1, index + 1)
          );
        }
      } else if (cmdKey || ctrlKey) {
        const foundIndex = this.damListViewModel.actionState.selectedCards.findIndex(
          (f) => f.id === card.id
        );
        // If found remove it to unselect it.
        if (foundIndex >= 0) {
          newSelectedCards = [
            ...this.damListViewModel.actionState.selectedCards.slice(0, foundIndex),
            ...this.damListViewModel.actionState.selectedCards.slice(foundIndex + 1),
          ];
        } else {
          newSelectedCards = [...this.damListViewModel.actionState.selectedCards, card];
        }
      } else if (contextClick) {
        const foundIndex = this.damListViewModel.actionState.selectedCards.findIndex(
          (f) => f.id === card.id
        );
        // If found remove it to unselect it.
        if (foundIndex >= 0) {
          newSelectedCards = [...this.damListViewModel.actionState.selectedCards];
        } else {
          newSelectedCards = [card];
        }
      }
      const finalList = cards
        ? newSelectedCards.map((item, i) => ({ ...item, indexSelected: i }))
        : [];

      this.damListViewModel.setActionState({
        selectedCards: finalList,
        lastSelectedIndex: newLastSelectedIndex,
      });
    };

    render() {
      const { assets, status, collections, isSearch } = this.damListViewModel;
      const { t } = this.props;

      if (status === PAGE_STATUS.LOADING) {
        return <Spinner />;
      }
      const tableRowHeader = [
        {
          id: 'selection',
        },
        {
          Header: <span className="text-uppercase text-gray-901">{t('txt_name')}</span>,
          accessor: DAM_COLUMN_INDICATOR.NAME, // accessor is the "key" in the data
          Cell: ({ row }) => (
            <div
              className={`d-flex w-100 ${
                this.damListViewModel.isList ? '' : ' justify-content-center'
              }`}
            >
              {!row.original[DAM_ASSETS_FIELD_KEY.TYPE] &&
              !row.original[DAM_ASSETS_FIELD_KEY.DOWNLOAD_URL] ? (
                // folder
                <div
                  className={`w-100 ${
                    this.damListViewModel.isList
                      ? 'd-flex align-items-center'
                      : 'd-flex flex-column align-items-center justify-content-center'
                  }`}
                >
                  <Image
                    visibleByDefault
                    alt={row.original.name}
                    src="/assets/images/folder.svg"
                    className={`${this.damListViewModel.isList ? '' : styles.folder} pe-none`}
                  />
                  <span
                    className={`${
                      this.damListViewModel.isList
                        ? 'ms-32px text-color'
                        : 'text-center text-color lcl lcl-2 d-block w-space'
                    } w-100`}
                  >
                    <CollectionName item={row.original} />
                    <span className="text-gray">
                      {row.original[DAM_COLUMN_INDICATOR.LAST_MODIFIED]
                        ? !this.damListViewModel.isList &&
                          moment(new Date(row.original[DAM_COLUMN_INDICATOR.LAST_MODIFIED])).format(
                            'DD MMM, YYYY'
                          )
                        : null}
                    </span>
                  </span>
                </div>
              ) : (
                // file
                <div
                  className={`${
                    this.damListViewModel.isList
                      ? 'd-flex align-items-center'
                      : 'd-flex flex-column align-items-center justify-content-center'
                  }`}
                >
                  <span
                    className={this.damListViewModel.isList ? styles.image_isList : styles.image}
                  >
                    {row.original?.[DAM_ASSETS_FIELD_KEY.TYPE] === 'image' ? (
                      <Image
                        visibleByDefault
                        wrapperClassName="w-100 h-100 pe-none"
                        className="w-100 h-100 object-fit-cover"
                        src={row.original?.[DAM_ASSETS_FIELD_KEY.DOWNLOAD_URL]}
                      />
                    ) : (
                      <Image
                        visibleByDefault
                        wrapperClassName="w-100 h-100 d-flex align-items-center justify-content-center pe-none"
                        src={utils.checkFileTypeFormData(row.original)}
                      />
                    )}
                  </span>

                  <span
                    className={
                      this.damListViewModel.isList
                        ? 'ms-3 text-color'
                        : 'w-100 lcl lcl-1 p-2 text-color'
                    }
                  >
                    {row.original[DAM_COLUMN_INDICATOR.NAME]}
                  </span>
                </div>
              )}
            </div>
          ),
        },

        {
          Header: <span className="text-uppercase text-gray-901">{t('txt_size')}</span>,
          accessor: DAM_COLUMN_INDICATOR.FILE_SIZE,
          Cell: ({ row }) => (
            <div className="d-flex">
              <span className="">
                {row.original[DAM_ASSETS_FIELD_KEY.TYPE]
                  ? row.original[DAM_ASSETS_FIELD_KEY.FILE_SIZE]
                  : row.original[DAM_COLLECTION_FIELD_KEY.FILE_SIZE]}
                KB
              </span>
            </div>
          ),
        },
        {
          Header: <span className="text-uppercase text-gray-901">{t('txt_owner')}</span>,
          accessor: DAM_COLUMN_INDICATOR.OWNER,
        },
        {
          Header: <span className="text-uppercase text-gray-901">{t('txt_last_modified')}</span>,
          accessor: DAM_COLUMN_INDICATOR.LAST_MODIFIED,
          Cell: ({ row }) => (
            <>
              {row.original[DAM_COLUMN_INDICATOR.LAST_MODIFIED]
                ? moment(new Date(row.original[DAM_COLUMN_INDICATOR.LAST_MODIFIED])).format(
                    'DD MMM, YYYY'
                  )
                : null}
            </>
          ),
        },
      ];

      const collectionId = history.location.pathname.split('/');

      let handleCollections = [];
      let handleAssets = [];
      if (!isNaN(+collectionId[collectionId.length - 1])) {
        handleAssets = assets.filter(
          (asset) =>
            +asset[DAM_ASSETS_FIELD_KEY.COLLECTION_ID] === +collectionId[collectionId.length - 1]
        );
        handleCollections = collections.filter(
          (collection) =>
            +collection[DAM_COLLECTION_FIELD_KEY.PARENT_ID] ===
            +collectionId[collectionId.length - 1]
        );
      } else {
        if (isSearch) {
          handleAssets = assets;
          handleCollections = collections;
        } else {
          handleAssets = assets.filter((asset) => +asset[DAM_ASSETS_FIELD_KEY.COLLECTION_ID] === 0);
          handleCollections = collections.filter(
            (collection) => collection[DAM_COLLECTION_FIELD_KEY.PARENT_ID] === 0
          );
        }
      }

      return (
        <div
          className="position-relative col d-flex flex-column"
          id="outside"
          onContextMenu={this.handleRightClick}
          onClick={this.handleClickOutSite}
        >
          {handleCollections || handleAssets ? (
            <>
              <Table
                rowData={[...handleCollections, ...handleAssets]}
                dataCollections={handleCollections}
                dataAssets={handleAssets}
                tableRowHeader={tableRowHeader}
                onSelect={this.handleSelect}
                isThumb={true}
                isList={this.damListViewModel.isList}
                dataThumb={[
                  'selection',
                  DAM_COLUMN_INDICATOR.FILE_SIZE,
                  DAM_COLUMN_INDICATOR.OWNER,
                  DAM_COLUMN_INDICATOR.LAST_MODIFIED,
                ]}
                listViewModel={this.damListViewModel}
                hasSubRow={false}
                _handleList={this._handleList}
                view={this.view}
                thumbColumnsNumber={2}
                onDoubleClick={this.handleDoubleClick}
                createAssets={this.handleCreateAssets}
                onFilter={this.handleFilter}
                onSortby={this.handleSortBy}
                onRightClickItem={this.handleRightClickItem}
                onSelectionChange={this.handleItemSelection}
                onRowSelectStateChange={this.onRowSelectStateChange}
              />
            </>
          ) : (
            <ComponentNoData
              icons="/assets/images/ic_project.svg"
              title={t('create_your_1st_project')}
              width="w-50"
            />
          )}
        </div>
      );
    }
  }
);

export default withTranslation()(withRouter(withDamViewModel(HomeList)));
